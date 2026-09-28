import React from 'react';
import { PriorityLevel, ReportStatus } from '../../types/database.types';
import { AlertTriangle, CheckCircle, Clock, Eye, Flame, Shield } from 'lucide-react';

interface PriorityBadgeProps {
  level: PriorityLevel;
  score?: number;
  showScore?: boolean;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ level, score, showScore = true }) => {
  const getIcon = () => {
    switch (level) {
      case 'critical':
        return <Flame size={13} />;
      case 'high':
        return <AlertTriangle size={13} />;
      case 'medium':
        return <Clock size={13} />;
      case 'low':
        return <Shield size={13} />;
    }
  };

  return (
    <span className={`badge badge-${level}`}>
      {getIcon()}
      <span>{level.toUpperCase()}</span>
      {showScore && score !== undefined && <span style={{ opacity: 0.85 }}>({score})</span>}
    </span>
  );
};

interface StatusBadgeProps {
  status: ReportStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getIcon = () => {
    switch (status) {
      case 'submitted':
        return <Clock size={12} />;
      case 'under_review':
        return <Eye size={12} />;
      case 'in_progress':
        return <AlertTriangle size={12} />;
      case 'resolved':
        return <CheckCircle size={12} />;
      default:
        return <Clock size={12} />;
    }
  };

  const getLabel = () => {
    switch (status) {
      case 'submitted':
        return 'Submitted';
      case 'under_review':
        return 'Under Review';
      case 'in_progress':
        return 'In Progress';
      case 'resolved':
        return 'Resolved';
      case 'rejected':
        return 'Closed / Duplicate';
    }
  };

  return (
    <span className={`badge badge-${status}`}>
      {getIcon()}
      <span>{getLabel()}</span>
    </span>
  );
};
