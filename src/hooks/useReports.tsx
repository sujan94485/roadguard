import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ReportRecord, ReportStatus } from '../types/database.types';
import { NewReportInput, ReportFilterOptions } from '../types/report.types';
import { reportsService } from '../services/reportsService';
import { useAuth } from './useAuth';

interface ReportsContextType {
  reports: ReportRecord[];
  loading: boolean;
  error: string | null;
  filters: ReportFilterOptions;
  isConnectedMode: boolean;
  setFilters: React.Dispatch<React.SetStateAction<ReportFilterOptions>>;
  refreshReports: () => Promise<void>;
  submitReport: (input: NewReportInput) => Promise<ReportRecord>;
  updateStatus: (reportId: string, status: ReportStatus, comment: string) => Promise<ReportRecord>;
  resetDemoData: () => Promise<void>;
}

const defaultFilters: ReportFilterOptions = {
  searchQuery: '',
  hazardType: 'all',
  priorityLevel: 'all',
  status: 'all',
  sortBy: 'priority_score_desc'
};

const ReportsContext = createContext<ReportsContextType | undefined>(undefined);

export const ReportsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isDemoAuth } = useAuth();
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ReportFilterOptions>(defaultFilters);

  const isConnectedMode = reportsService.isConnectedMode();

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportsService.getAllReports(filters);
      setReports(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch road hazard reports');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Re-fetch when filters change or when user switches between Demo Mode and Connected Mode
  useEffect(() => {
    fetchReports();
  }, [fetchReports, isDemoAuth]);

  const submitReport = async (input: NewReportInput): Promise<ReportRecord> => {
    try {
      const created = await reportsService.createReport(input, user?.id || null);
      setReports(prev => [created, ...prev]);
      return created;
    } catch (err: any) {
      throw new Error(err?.message || 'Failed to submit report');
    }
  };

  const updateStatus = async (
    reportId: string,
    status: ReportStatus,
    comment: string
  ): Promise<ReportRecord> => {
    try {
      const adminInfo = user
        ? { id: user.id, name: user.full_name, department: user.department }
        : undefined;

      const updated = await reportsService.updateReportStatus(reportId, status, comment, adminInfo);
      setReports(prev => prev.map(r => (r.id === reportId ? updated : r)));
      return updated;
    } catch (err: any) {
      throw new Error(err?.message || 'Failed to update report status');
    }
  };

  const resetDemoData = async () => {
    reportsService.resetDemoData();
    await fetchReports();
  };

  return (
    <ReportsContext.Provider
      value={{
        reports,
        loading,
        error,
        filters,
        isConnectedMode,
        setFilters,
        refreshReports: fetchReports,
        submitReport,
        updateStatus,
        resetDemoData
      }}
    >
      {children}
    </ReportsContext.Provider>
  );
};

export function useReports(): ReportsContextType {
  const context = useContext(ReportsContext);
  if (!context) {
    throw new Error('useReports must be used within a ReportsProvider');
  }
  return context;
}
