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
import {
  AlertCircle,
  CheckCircle,
  Calculator,
  Send,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  MapPin,
  Sliders,
  Check,
  CheckCircle2,
  Cpu
} from 'lucide-react';

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

  // Dynamic Progress States
  const stepStates = useMemo(() => {
    const isStep1Done = Boolean(hazardType);
    const isStep2Done = Boolean(locationName.trim() && latitude && longitude);
    const isStep3Done = Boolean(severity && description.trim().length >= 10);
    const isStep4Done = Boolean(imageFile || imagePreview);
    const isReadyForSubmit = isStep1Done && isStep2Done && isStep3Done;

    return {
      step1: isStep1Done,
      step2: isStep2Done,
      step3: isStep3Done,
      step4: isStep4Done,
      ready: isReadyForSubmit
    };
  }, [hazardType, locationName, latitude, longitude, severity, description, imageFile, imagePreview]);

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

  const getPriorityColor = (level: string) => {
    switch (level) {
      case 'critical':
        return '#EF4444';
      case 'high':
        return '#F97316';
      case 'medium':
        return '#F59E0B';
      default:
        return '#10B981';
    }
  };

  const priorityColor = getPriorityColor(livePriority.level);

  // If submitted, show confirmation receipt state
  if (submittedCode) {
    return (
      <div
        className="card"
        style={{
          maxWidth: '680px',
          margin: '0 auto',
          textAlign: 'center',
          padding: '48px 32px',
          borderColor: '#10B981',
          background: 'radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.12) 0%, rgba(15, 23, 42, 0.95) 75%), #0B0F19',
          boxShadow: '0 20px 60px -15px rgba(0, 0, 0, 0.8), 0 0 30px rgba(16, 185, 129, 0.12)'
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 18px auto',
            color: '#10B981',
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.25)'
          }}
        >
          <CheckCircle size={36} />
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.6875rem', fontWeight: 700, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
          <CheckCircle2 size={13} />
          <span>TRIAGE RECEIPT ISSUED</span>
        </div>

        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#F8FAFC', marginBottom: '8px', letterSpacing: '-0.02em' }}>
          Hazard Report Submitted
        </h2>
        <p style={{ color: '#94A3B8', fontSize: '0.9375rem', marginBottom: '28px', maxWidth: '520px', margin: '0 auto 28px auto' }}>
          Your report has been entered into the municipal triage queue with deterministic priority scoring. Retain your tracking code to follow resolution milestones.
        </p>

        {/* Tracking ID Display Box */}
        <div
          style={{
            backgroundColor: 'rgba(11, 15, 25, 0.9)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '28px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)'
          }}
        >
          <div style={{ fontSize: '0.71875rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
            AUDITABLE TRACKING CODE
          </div>
          <div
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              color: '#38BDF8',
              letterSpacing: '0.04em',
              margin: '6px 0',
              fontFamily: 'JetBrains Mono, monospace'
            }}
          >
            {submittedCode}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Calculated Priority:</span>
            <PriorityBadge level={livePriority.level} score={livePriority.score} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <button className="btn btn-primary btn-lg" onClick={() => onSuccess(submittedCode)}>
            <span>Track Resolution Lifecycle</span>
            <ArrowRight size={17} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
      {/* ==================================================================
          GUIDED PROGRESS RAIL
          ================================================================== */}
      <div className="guided-progress-rail" role="navigation" aria-label="Incident Intake Progress">
        <div className={`progress-rail-step ${stepStates.step1 ? 'completed' : 'active'}`}>
          <div className="step-num-pill">{stepStates.step1 ? <Check size={11} strokeWidth={3} /> : '01'}</div>
          <span className="step-name-text">01 HAZARD</span>
        </div>

        <div className={`progress-rail-step ${stepStates.step2 ? 'completed' : stepStates.step1 ? 'active' : ''}`}>
          <div className="step-num-pill">{stepStates.step2 ? <Check size={11} strokeWidth={3} /> : '02'}</div>
          <span className="step-name-text">02 LOCATION</span>
        </div>

        <div className={`progress-rail-step ${stepStates.step3 ? 'completed' : stepStates.step2 ? 'active' : ''}`}>
          <div className="step-num-pill">{stepStates.step3 ? <Check size={11} strokeWidth={3} /> : '03'}</div>
          <span className="step-name-text">03 SEVERITY</span>
        </div>

        <div className={`progress-rail-step ${stepStates.step4 ? 'completed' : stepStates.step3 ? 'active' : ''}`}>
          <div className="step-num-pill">{stepStates.step4 ? <Check size={11} strokeWidth={3} /> : '04'}</div>
          <span className="step-name-text">04 EVIDENCE</span>
        </div>

        <div className={`progress-rail-step ${stepStates.ready ? 'active' : ''}`}>
          <div className="step-num-pill">{stepStates.ready ? <Check size={11} strokeWidth={3} /> : '05'}</div>
          <span className="step-name-text">05 REVIEW</span>
        </div>
      </div>

      {/* Error Banner */}
      {formErrors.length > 0 && (
        <div
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #DC2626',
            borderRadius: '10px',
            padding: '14px 18px',
            color: '#FCA5A5',
            fontSize: '0.875rem',
            marginBottom: '24px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, marginBottom: '6px' }}>
            <AlertCircle size={18} color="#EF4444" />
            <span>Please correct the following:</span>
          </div>
          <ul style={{ paddingLeft: '24px', margin: 0 }}>
            {formErrors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* ==================================================================
          STAGE 01: HAZARD CLASSIFICATION
          ================================================================== */}
      <div className="intake-stage-card">
        <div className="stage-header">
          <div>
            <div className="stage-tag">
              <span>STAGE 01</span>
              <span>•</span>
              <span>CLASSIFICATION</span>
            </div>
            <h2 className="stage-title">What type of road hazard is it?</h2>
            <p className="stage-desc">
              Select the classification that most accurately characterizes the road surface, signal, or lighting condition.
            </p>
          </div>
        </div>

        <HazardTypeSelector selectedType={hazardType} onSelect={setHazardType} />
      </div>

      {/* ==================================================================
          STAGE 02: LOCATION INTELLIGENCE
          ================================================================== */}
      <div className="intake-stage-card">
        <div className="stage-header">
          <div>
            <div className="stage-tag">
              <span>STAGE 02</span>
              <span>•</span>
              <span>LOCATION INTELLIGENCE</span>
            </div>
            <h2 className="stage-title">Where is the incident located?</h2>
            <p className="stage-desc">
              Provide landmark details and position the pinpoint on the interactive satellite/street grid.
            </p>
          </div>
        </div>

        {/* Landmark / Street Name Input */}
        <div className="form-group" style={{ marginBottom: '16px' }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={15} color="#38BDF8" />
            <span>Landmark or Street Name</span>
          </label>
          <input
            type="text"
            className="form-control"
            placeholder="e.g. Near College Gate, SJCE / JSS Campus Road, or Hardinge Circle"
            value={locationName}
            onChange={e => setLocationName(e.target.value)}
            required
            style={{ fontSize: '0.875rem' }}
          />
        </div>

        {/* Spatial Position Leaflet Map */}
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

      {/* ==================================================================
          STAGE 03: RISK ASSESSMENT (SEVERITY + OPERATIONAL NARRATIVE)
          ================================================================== */}
      <div className="intake-stage-card">
        <div className="stage-header">
          <div>
            <div className="stage-tag">
              <span>STAGE 03</span>
              <span>•</span>
              <span>INCIDENT ASSESSMENT</span>
            </div>
            <h2 className="stage-title">Severity & Operational Description</h2>
            <p className="stage-desc">
              Evaluate immediate traffic risk and provide narrative context for public works dispatchers.
            </p>
          </div>
        </div>

        {/* Severity Selection */}
        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sliders size={15} color="#38BDF8" />
            <span>Severity Level (Perceived Physical Hazard)</span>
          </label>
          <select
            className="form-control"
            value={severity}
            onChange={e => setSeverity(e.target.value as SeverityLevel)}
            style={{ fontSize: '0.875rem' }}
          >
            <option value="minor">Minor (10 pts) — Surface hairline cracking, minor bump, low disruption</option>
            <option value="moderate">Moderate (20 pts) — Noticeable depression, vehicles slow down to pass</option>
            <option value="severe">Severe (30 pts) — Deep crater, wheel damage risk, riders forced to swerve</option>
            <option value="catastrophic">Critical (35 pts) — Impassable road, structural collapse, acute collision danger</option>
          </select>
        </div>

        {/* Operational Description Textarea */}
        <div className="form-group" style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label className="form-label" style={{ margin: 0 }}>
              Operational Description
            </label>
            <div
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.6875rem',
                color: description.trim().length >= 10 ? '#34D399' : '#94A3B8',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {description.trim().length >= 10 && <Check size={12} color="#34D399" />}
              <span>{description.trim().length} / 10 chars minimum</span>
            </div>
          </div>
          <textarea
            className="form-control"
            placeholder="Describe defect dimensions, lane placement (left lane/center/curb), impact on two-wheelers, or emergency vehicle impedance..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            required
            style={{ fontSize: '0.875rem' }}
          />
        </div>

        {/* ==================================================================
            STAGE 04: EVIDENCE CAPTURE (OPTIONAL PHOTO UPLOAD)
            ================================================================== */}
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
        <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '16px' }}>
          <button
            type="button"
            className="context-drawer-btn"
            onClick={() => setShowAdvancedContext(!showAdvancedContext)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sliders size={14} color="#38BDF8" />
              <span>{showAdvancedContext ? 'Collapse' : 'Expand'} Optional Context (Corridor Type & Vulnerability Zone)</span>
            </div>
            {showAdvancedContext ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>

          {showAdvancedContext && (
            <div className="grid-2" style={{ marginTop: '14px', backgroundColor: 'rgba(11, 15, 25, 0.9)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(56, 189, 248, 0.15)' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.78125rem' }}>Roadway Exposure Profile</label>
                <select
                  className="form-control"
                  value={trafficExposure}
                  onChange={e => setTrafficExposure(e.target.value as TrafficExposureLevel)}
                  style={{ fontSize: '0.8125rem' }}
                >
                  <option value="low">Local residential street / Colony road (5 pts)</option>
                  <option value="medium">Collector road (Normal local traffic) (15 pts)</option>
                  <option value="high">Busy main road / Commercial avenue (20 pts)</option>
                  <option value="arterial">High-speed road / Highway corridor (25 pts)</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.78125rem' }}>Civic Vulnerability Zone</label>
                <select
                  className="form-control"
                  value={vulnerabilityLevel}
                  onChange={e => setVulnerabilityLevel(e.target.value as VulnerabilityZone)}
                  style={{ fontSize: '0.8125rem' }}
                >
                  <option value="standard">Standard roadway corridor (5 pts)</option>
                  <option value="transit_hub">Transit station, bus terminus, or depot (12 pts)</option>
                  <option value="hospital_zone">Hospital route or medical corridor (16 pts)</option>
                  <option value="school_zone">School, college campus, or playground zone (20 pts)</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* ==================================================================
            STAGE 05: TRIAGE PREVIEW (RULE-BASED PRIORITY SCORE)
            ================================================================== */}
        <div className="triage-preview-panel">
          <div className="triage-header-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#38BDF8',
                  flexShrink: 0
                }}
              >
                <Calculator size={16} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#F8FAFC' }}>
                    TRIAGE PREVIEW
                  </span>
                  <span style={{ fontSize: '0.625rem', color: '#38BDF8', backgroundColor: 'rgba(56, 189, 248, 0.15)', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                    RULE-BASED
                  </span>
                </div>
                <div style={{ fontSize: '0.71875rem', color: '#94A3B8' }}>
                  Deterministic priority calculation based on Severity ({livePriority.factors[0]?.score || 0}) + Exposure ({livePriority.factors[1]?.score || 0}) + Zone ({livePriority.factors[2]?.score || 0})
                </div>
              </div>
            </div>

            {/* Score Pill Display */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: 'rgba(11, 15, 25, 0.9)',
                border: `1px solid ${priorityColor}`,
                padding: '6px 14px',
                borderRadius: '8px',
                boxShadow: `0 0 14px ${priorityColor}22`
              }}
            >
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.625rem', color: '#94A3B8', fontWeight: 600 }}>SCORE</div>
                <div
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: priorityColor,
                    fontFamily: 'JetBrains Mono, monospace',
                    lineHeight: 1
                  }}
                >
                  {livePriority.score} / 100
                </div>
              </div>
              <div
                style={{
                  padding: '3px 8px',
                  borderRadius: '5px',
                  backgroundColor: `${priorityColor}20`,
                  color: priorityColor,
                  fontWeight: 800,
                  fontSize: '0.71875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}
              >
                {livePriority.level}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================================
          STAGE 06: SUBMISSION READY & ACTION
          ================================================================== */}
      <div>
        {/* Verification Checkpoints */}
        <div className="submission-checkpoint-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={15} color="#38BDF8" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#E2E8F0', letterSpacing: '0.04em' }}>
              SUBMISSION READY
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div className={`checkpoint-pill ${stepStates.step1 ? 'active' : ''}`}>
              <CheckCircle2 size={13} color={stepStates.step1 ? '#10B981' : '#64748B'} />
              <span>Hazard Classified</span>
            </div>
            <div className={`checkpoint-pill ${stepStates.step2 ? 'active' : ''}`}>
              <CheckCircle2 size={13} color={stepStates.step2 ? '#10B981' : '#64748B'} />
              <span>Coordinates Geotagged</span>
            </div>
            <div className={`checkpoint-pill ${stepStates.step3 ? 'active' : ''}`}>
              <CheckCircle2 size={13} color={stepStates.step3 ? '#10B981' : '#64748B'} />
              <span>Severity Assessed</span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            type="submit"
            disabled={isSubmitting || loadingAuth}
            className="btn-hero-primary"
            style={{
              padding: '13px 28px',
              fontSize: '0.9375rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              cursor: isSubmitting || loadingAuth ? 'not-allowed' : 'pointer',
              opacity: isSubmitting || loadingAuth ? 0.7 : 1
            }}
          >
            <Send size={16} />
            <span>
              {loadingAuth
                ? 'Verifying Session...'
                : isSubmitting
                ? 'Registering Work Order...'
                : 'Submit Hazard Report'}
            </span>
          </button>
        </div>
      </div>
    </form>
  );
};
