import { isSupabaseConfigured, supabase } from '../lib/supabase';

export interface StorageUploadResult {
  url: string;
  storagePath: string | null;
  isDemo: boolean;
}

const BUCKET_NAME = 'hazard-evidence';
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Validates file MIME type and size.
 */
export function validateHazardImage(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file format. Only JPEG, PNG, and WebP images are permitted.'
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File size (${sizeInMb} MB) exceeds maximum allowed limit of 5.0 MB.`
    };
  }

  return { valid: true };
}

/**
 * Compresses an image file client-side using HTML5 Canvas.
 * Produces a lightweight data URL (~40-90 KB) suitable for browser memory/demo persistence
 * without exhausting localStorage quotas.
 */
export async function createCompressedPreview(
  file: File,
  maxWidth = 720,
  quality = 0.6
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to decode image data.'));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Use JPEG compression for compact size
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads a hazard evidence photo to Supabase Storage in Connected Mode,
 * or generates a lightweight compressed preview in Demo Mode.
 */
export async function uploadHazardEvidence(
  file: File,
  forceDemo = false
): Promise<StorageUploadResult> {
  const validation = validateHazardImage(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Connected Mode via Supabase Storage
  if (isSupabaseConfigured && supabase && !forceDemo) {
    // 1. Verify active authenticated session (Requirement 3)
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    const session = sessionData?.session;

    if (sessionError || !session || !session.user || !session.user.id) {
      console.error('[storageService] Photo upload rejected: Missing or expired authenticated session', {
        sessionError,
        hasSession: !!session,
        hasUserId: !!session?.user?.id
      });
      throw new Error(
        'Authentication required: Please sign in to an authenticated citizen account before uploading photographic evidence.'
      );
    }

    const userId = session.user.id;
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const sanitizedExt = ['jpg', 'jpeg', 'png', 'webp'].includes(fileExt) ? fileExt : 'jpg';
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 9);
    // User-scoped path conforming to storage policy and clean organization (Requirement 4)
    const objectPath = `${userId}/evidence-${timestamp}-${randomSuffix}.${sanitizedExt}`;

    console.log('[storageService] Initiating evidence photo upload:', {
      bucket: BUCKET_NAME,
      objectPath,
      userId,
      fileSize: file.size,
      mimeType: file.type
    });

    try {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(objectPath, file, {
          cacheControl: '3600',
          upsert: false, // Strictly non-upsert with unique filenames (Requirement 7)
          contentType: file.type
        });

      if (error) {
        console.error('[storageService] Supabase storage upload error details:', {
          message: error.message,
          name: error.name,
          error
        });

        // Provide informative user-facing diagnostics instead of a generic message
        if (error.message.includes('already exists')) {
          throw new Error('An evidence file with this name already exists. Please try again.');
        }
        if (error.message.includes('row-level security') || error.message.includes('permission')) {
          throw new Error('Storage permission denied by database security policy. Please verify your account access.');
        }
        if (error.message.includes('Payload too large') || error.message.includes('exceeded the maximum')) {
          throw new Error('The selected image exceeds the maximum permitted file size of 5.0 MB.');
        }
        if (error.message.includes('mime type') || error.message.includes('not supported')) {
          throw new Error('Image format rejected by storage policy. Only JPEG, PNG, and WebP are allowed.');
        }
        if (error.message.includes('Failed to fetch')) {
          const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
          if (isOffline) {
            throw new Error('Network connection offline. Please check your internet connectivity and try again.');
          }
          throw new Error(
            'Unable to connect to Supabase Storage endpoint (Network/CORS error). Please check your internet connection or try again.'
          );
        }

        throw new Error(`Cloud photo upload failed: ${error.message}`);
      }

      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(data.path);

      console.log('[storageService] Photo uploaded successfully:', {
        storagePath: data.path,
        publicUrl: publicUrlData.publicUrl
      });

      return {
        url: publicUrlData.publicUrl,
        storagePath: data.path,
        isDemo: false
      };
    } catch (networkErr: any) {
      if (networkErr.message?.startsWith('Cloud photo upload') || networkErr.message?.startsWith('Authentication required')) {
        throw networkErr;
      }
      console.error('[storageService] Unexpected exception during upload:', networkErr);
      throw new Error(`Cloud photo upload failed: ${networkErr.message || 'Network request failed'}`);
    }
  }

  // Demo Mode: generate compact preview
  const compressedPreview = await createCompressedPreview(file);
  return {
    url: compressedPreview,
    storagePath: null,
    isDemo: true
  };
}
