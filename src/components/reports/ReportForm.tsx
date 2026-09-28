import React, { useState, useMemo } from 'react';
import { HazardType, SeverityLevel, TrafficExposureLevel, VulnerabilityZone } from '../../types/database.types';
import { NewReportInput } from '../../types/report.types';
import { useReports } from '../../hooks/useReports';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { HazardTypeSelector } from './HazardTypeSelector';
import { LocationPicker } from '../map/LocationPicker';
import { ImageUploadWithAI } from './ImageUploadWithAI';
import { calculateHazardPriority } from '../../services/priorityEngine';
import { uploadHazardEvidence } from '../../services/storageService';
import { PriorityBadge } from '../common/Badge';

import { DEFAULT_MAP_CENTER } from '../../services/mapConfig';
import { AlertCircle, CheckCircle, Calculator, Send, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';

interface ReportFormProps {
  onSuccess: (reportCode: string) => void;
}

export const ReportForm: React.FC<ReportFormProps> = ({ onSuccess }) => {
  const { submitReport } = useReports();
  const { user, loadingAuth, isSupabaseConnected } = useAuth();

  // Core Form State (Citizen friendly)
  const [hazardType, setHazardType] = useState<HazardType>('pothole');
  const [locationName, setLocationName] = useState<string>('Near College Gate, SJCE / JSS Campus Road');
  const [latitude, setLatitude] = useState<number>(DEFAULT_MAP_CENTER[0]);
  const [longitude, setLongitude] = useState<number>(DEFAULT_MAP_CENTER[1]);
  const [description, setDescription] = useState<string>('');
  const [severity, setSeverity] = useState<SeverityLevel>('severe');

  // Optional Context State (Plain Language with sensible defaults)
  const [showAdvancedContext, setShowAdvancedContext] = useState(false);
  const [trafficExposure, setTrafficExposure] = useState<TrafficExposureLevel>('high');
  const [vulnerabilityLevel, setVulnerabilityLevel] = useState<VulnerabilityZone>('school_zone');

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<any>(null);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);

  // Live Priority Engine Calculation
  const livePriority = useMemo(() => {
    return calculateHazardPriority({
      hazard_type: hazardType,
      severity,
      traffic_exposure: trafficExposure,
      vulnerability_level: vulnerabilityLevel,
      existing_cluster_count: 0
    });
  }, [hazardType, severity, trafficExposure, vulnerabilityLevel]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: string[] = [];

    if (loadingAuth) {
      setFormErrors(['Please wait for your session to finish verifying before submitting.']);
      return;
    }

    if (isSupabaseConnected && user && supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setFormErrors([
          'Your authentication session is not active in the database. Please sign in again before submitting a report.'
        ]);
        return;
      }
    }

    if (!locationName.trim()) {
      errors.push('Please enter a landmark or street location.');
    }
    if (!description.trim() || description.trim().length < 10) {
      errors.push('Please provide a brief description (at least 10 characters).');
    }
    if (!latitude || !longitude) {
      errors.push('Please ensure a location pin is set on the map.');
    }

    if (isSupabaseConnected && imageFile && !user) {
      setFormErrors([
        'Please sign in to an authenticated citizen account before uploading photographic evidence.'
      ]);
      return;
    }

    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors([]);
    setIsSubmitting(true);

    try {
      let finalImageUrl: string | null = null;
      if (imageFile) {
        const uploadResult = await uploadHazardEvidence(imageFile);
        finalImageUrl = uploadResult.url;
      } else if (!isSupabaseConnected) {
        // Only persist local preview in Demo Mode
        finalImageUrl = imagePreview;
      }

      const input: NewReportInput = {
        hazard_type: hazardType,
        location_name: locationName.trim(),
        latitude,
        longitude,
        description: description.trim(),
        severity,
        traffic_exposure: trafficExposure,
        vulnerability_level: vulnerabilityLevel,
        image_file: imageFile,
        image_preview: finalImageUrl,
        ai_suggestion: aiSuggestion
      };

      const result = await submitReport(input);
      setSubmittedCode(result.report_code);
    } catch (err: any) {
      setFormErrors([err?.message || 'Submission failed. Please try again.']);
    } finally {
      setIsSubmitting(false);
    }
  };


  // If submitted, show confirmation state
  if (submittedCode) {
    return (
      <div
        className="card"
        style={{
          maxWidth: '640px',
          margin: '0 auto',
          textAlign: 'center',
          padding: '40px 24px',
          borderColor: '#10B981'
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            color: '#10B981'
          }}
        >
          <CheckCircle size={36} />
        </div>

        <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Hazard Report Submitted</h2>
        <p style={{ color: '#94A3B8', fontSize: '0.9375rem', marginBottom: '24px' }}>
          Your report has been entered into the triage system and prioritized for review.
        </p>

        <div
          style={{
            backgroundColor: '#0F172A',
            border: '1px solid #1E293B',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '28px'
          }}
        >
          <div style={{ fontSize: '0.75rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Report Tracking ID
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#38BDF8', letterSpacing: '0.02em', margin: '4px 0' }}>
            {submittedCode}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '8px' }}>
            <PriorityBadge level={livePriority.level} score={livePriority.score} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
          <button className="btn btn-primary" onClick={() => onSuccess(submittedCode)}>
            <span>Track Resolution Status</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {formErrors.length > 0 && (
        <div
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #DC2626',
            borderRadius: '8px',
            padding: '14px 18px',
            color: '#FCA5A5',
            fontSize: '0.875rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, marginBottom: '6px' }}>
            <AlertCircle size={18} />
            <span>Please correct the following:</span>
          </div>
          <ul style={{ paddingLeft: '24px', margin: 0 }}>
            {formErrors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 1. Hazard Type */}
      <div className="card">
        <h3 style={{ fontSize: '1.125rem', marginBottom: '4px' }}>1. What type of hazard is it?</h3>
        <p style={{ fontSize: '0.8125rem', color: '#94A3B8', marginBottom: '14px' }}>
          Select the option that best describes the road safety issue.
        </p>
        <HazardTypeSelector selectedType={hazardType} onSelect={setHazardType} />
      </div>

      {/* 2. Location */}
      <div className="card">
        <h3 style={{ fontSize: '1.125rem', marginBottom: '4px' }}>2. Where is it located?</h3>
        <p style={{ fontSize: '0.8125rem', color: '#94A3B8', marginBottom: '14px' }}>
          Enter a street name or landmark, and pin the approximate spot on the map.
        </p>

        <div className="form-group">
          <label className="form-label">Landmark or Street Name</label>
          <input
            type="text"
            className="form-control"
            placeholder="e.g. Near College Gate, MG Road, or KR Hospital Junction"
            value={locationName}
            onChange={e => setLocationName(e.target.value)}
            required
          />
        </div>

        <LocationPicker
          latitude={latitude}
          longitude={longitude}
          locationName={locationName}
          onChange={(lat, lng, addr) => {
            setLatitude(lat);
            setLongitude(lng);
            if (addr && !locationName) {
              setLocationName(addr);
            }
          }}
        />
      </div>

      {/* 3. Severity & Description */}
      <div className="card">
        <h3 style={{ fontSize: '1.125rem', marginBottom: '4px' }}>3. How severe is the hazard?</h3>
        <p style={{ fontSize: '0.8125rem', color: '#94A3B8', marginBottom: '14px' }}>
          Indicate the perceived risk to vehicles and pedestrians.
        </p>

        <div className="form-group">
          <label className="form-label">Severity Level</label>
          <select
            className="form-control"
            value={severity}
            onChange={e => setSeverity(e.target.value as SeverityLevel)}
          >
            <option value="minor">Minor — Surface cracking, minor bump, low disruption</option>
            <option value="moderate">Moderate — Noticeable pothole, vehicles slow down</option>
            <option value="severe">Severe — Deep crater, wheel damage risk, swerving required</option>
            <option value="catastrophic">Critical — Impassable road, cave-in, or acute crash danger</option>
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: '16px' }}>
          <label className="form-label">Description of Hazard</label>
          <textarea
            className="form-control"
            placeholder="Briefly describe the defect, size, lane position, or potential danger..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            required
          />
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>
            At least 10 characters ({description.length} entered).
          </div>
        </div>

        <ImageUploadWithAI
          onImageSelected={(file, preview) => {
            setImageFile(file);
            setImagePreview(preview);
          }}
          onApplyAISuggestion={(type, suggestion) => {
            setHazardType(type);
            setAiSuggestion(suggestion);
          }}
        />

        {/* Collapsible Additional Road Context (Optional) */}
        <div style={{ marginTop: '16px', borderTop: '1px solid #1E293B', paddingTop: '12px' }}>
          <button
            type="button"
            onClick={() => setShowAdvancedContext(!showAdvancedContext)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#38BDF8',
              fontSize: '0.8125rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              padding: 0
            }}
          >
            <span>{showAdvancedContext ? 'Hide' : 'Add'} Optional Road Context (Road Type & Nearby Area)</span>
            {showAdvancedContext ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>

          {showAdvancedContext && (
            <div className="grid-2" style={{ marginTop: '14px', backgroundColor: '#0B0F19', padding: '14px', borderRadius: '8px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.8125rem' }}>Road Type (Optional)</label>
                <select
                  className="form-control"
                  value={trafficExposure}
                  onChange={e => setTrafficExposure(e.target.value as TrafficExposureLevel)}
                  style={{ fontSize: '0.8125rem' }}
                >
                  <option value="low">Local residential street / Colony road</option>
                  <option value="medium">Collector road (Normal local traffic)</option>
                  <option value="high">Busy main road / Commercial avenue</option>
                  <option value="arterial">High-speed road / Highway approach</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.8125rem' }}>Nearby Location (Optional)</label>
                <select
                  className="form-control"
                  value={vulnerabilityLevel}
                  onChange={e => setVulnerabilityLevel(e.target.value as VulnerabilityZone)}
                  style={{ fontSize: '0.8125rem' }}
                >
                  <option value="standard">General road area</option>
                  <option value="transit_hub">Near bus stand, auto stand, or station</option>
                  <option value="hospital_zone">Near hospital or healthcare center</option>
                  <option value="school_zone">Near school, college, or playground</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Priority Engine Preview */}
        <div
          style={{
            marginTop: '20px',
            backgroundColor: '#0F172A',
            border: '1px solid #1E293B',
            borderRadius: '8px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Calculator size={18} color="#38BDF8" />
            <div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#F8FAFC' }}>
                Rule-Based Priority Score
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                Transparent calculation based on severity, road type, and surroundings
              </div>
            </div>
          </div>
          <PriorityBadge level={livePriority.level} score={livePriority.score} />
        </div>
      </div>

      {/* Submit Action */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        <button
          type="submit"
          disabled={isSubmitting || loadingAuth}
          className="btn btn-primary btn-lg"
          style={{ minWidth: '200px' }}
        >
          <Send size={16} />
          <span>{loadingAuth ? 'Verifying Session...' : isSubmitting ? 'Submitting...' : 'Submit Hazard Report'}</span>
        </button>
      </div>
    </form>
  );
};
