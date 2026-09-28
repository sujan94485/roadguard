import React, { useState, useRef } from 'react';
import { AISuggestion, HazardType } from '../../types/database.types';
import { analyzeHazardImage } from '../../services/aiClassifier';
import { validateHazardImage, createCompressedPreview } from '../../services/storageService';
import { Upload, Sparkles, X, AlertCircle, CheckCircle2, ShieldQuestion } from 'lucide-react';


interface ImageUploadWithAIProps {
  onImageSelected: (file: File | null, previewUrl: string | null) => void;
  onApplyAISuggestion?: (suggestedType: HazardType, suggestion: AISuggestion) => void;
}

export const ImageUploadWithAI: React.FC<ImageUploadWithAIProps> = ({
  onImageSelected,
  onApplyAISuggestion
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<AISuggestion | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type and size via centralized storage service
    const validation = validateHazardImage(file);
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Invalid photo.');
      return;
    }

    setErrorMessage(null);
    setSelectedFile(file);

    try {
      // Create a lightweight compressed preview for local display without memory exhaustion
      const compressedPreview = await createCompressedPreview(file, 640, 0.65);
      setPreview(compressedPreview);
      onImageSelected(file, compressedPreview);
    } catch {
      // Fallback
      onImageSelected(file, null);
    }
    setAiSuggestion(null);
  };


  const handleClear = () => {
    setPreview(null);
    setSelectedFile(null);
    setAiSuggestion(null);
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onImageSelected(null, null);
  };

  const handleAnalyzeWithAI = async () => {
    if (!selectedFile) return;

    try {
      setIsAnalyzing(true);
      setErrorMessage(null);
      const result = await analyzeHazardImage(selectedFile);
      setAiSuggestion(result.suggestion);
    } catch (err: any) {
      setErrorMessage('AI vision assistant temporarily unavailable. You may proceed manually.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Upload size={16} color="#38BDF8" />
        <span>Photographic Hazard Evidence (Optional)</span>
      </label>

      {errorMessage && (
        <div
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #DC2626',
            borderRadius: '6px',
            padding: '8px 12px',
            fontSize: '0.8125rem',
            color: '#FCA5A5',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <AlertCircle size={15} />
          <span>{errorMessage}</span>
        </div>
      )}

      {!preview ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: '2px dashed #374151',
            borderRadius: '8px',
            padding: '28px 16px',
            textAlign: 'center',
            backgroundColor: '#0F172A',
            cursor: 'pointer',
            transition: 'border-color 0.15s ease'
          }}
          onDragOver={e => e.preventDefault()}
          onDrop={e => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            if (file) {
              if (fileInputRef.current) {
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                fileInputRef.current.files = dataTransfer.files;
                handleFileChange({ target: fileInputRef.current } as any);
              }
            }
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <Upload size={32} color="#64748B" style={{ margin: '0 auto 8px auto' }} />
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#F1F5F9', marginBottom: '4px' }}>
            Click or drag & drop road hazard photo here
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
            Supports JPEG, PNG, WebP up to 5MB
          </div>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: '#0F172A',
            border: '1px solid #1E293B',
            borderRadius: '8px',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img
                src={preview}
                alt="Hazard preview"
                style={{
                  width: '64px',
                  height: '64px',
                  objectFit: 'cover',
                  borderRadius: '6px',
                  border: '1px solid #334155'
                }}
              />
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#F8FAFC' }}>
                  {selectedFile?.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                  {((selectedFile?.size || 0) / 1024).toFixed(1)} KB — Ready to upload
                </div>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleClear}
              style={{ padding: '6px 10px' }}
            >
              <X size={14} /> Remove
            </button>
          </div>

          {/* AI Assist Trigger */}
          {!aiSuggestion ? (
            <div style={{ borderTop: '1px solid #1E293B', paddingTop: '10px' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleAnalyzeWithAI}
                disabled={isAnalyzing}
                style={{
                  backgroundColor: 'rgba(56, 189, 248, 0.1)',
                  borderColor: '#0284C7',
                  color: '#38BDF8',
                  fontSize: '0.8125rem'
                }}
              >
                <Sparkles size={14} />
                <span>{isAnalyzing ? 'Analyzing Image...' : 'Analyze Image with Assistive AI'}</span>
              </button>
            </div>
          ) : (
            /* Assistive Suggestion Box */
            <div
              style={{
                backgroundColor: '#1E293B',
                border: '1px solid #38BDF8',
                borderRadius: '8px',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={15} color="#38BDF8" />
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#38BDF8' }}>
                    Assistive AI Classification Suggestion
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    color: '#6EE7B7',
                    fontWeight: 700
                  }}
                >
                  {aiSuggestion.confidence.toUpperCase()} CONFIDENCE ({aiSuggestion.confidence_percentage}%)
                </span>
              </div>

              <p style={{ fontSize: '0.8125rem', color: '#CBD5E1', margin: 0 }}>
                {aiSuggestion.notes} Suggested Category:{' '}
                <strong style={{ color: '#F8FAFC' }}>
                  {aiSuggestion.suggested_hazard.replace(/_/g, ' ').toUpperCase()}
                </strong>
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.6875rem', color: '#94A3B8' }}>
                <ShieldQuestion size={13} color="#F59E0B" />
                <span>
                  Assistive suggestion only. Please verify or modify before submitting.
                </span>
              </div>

              {onApplyAISuggestion && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                    onClick={() => onApplyAISuggestion(aiSuggestion.suggested_hazard, aiSuggestion)}
                  >
                    <CheckCircle2 size={13} />
                    Apply Suggestion
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
