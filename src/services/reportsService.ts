import {
  ReportRecord,
  ReportStatus,
  ReportUpdateRecord,
  ReportInsertPayload,
  ReportUpdateInsertPayload
} from '../types/database.types';
import { NewReportInput, ReportFilterOptions } from '../types/report.types';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { INITIAL_DEMO_REPORTS, INITIAL_DEMO_UPDATES } from '../utils/demoData';
import {
  calculateHazardPriority,
  createPriorityBreakdown,
  recalculateDynamicPriority
} from './priorityEngine';

const LOCAL_STORAGE_REPORTS_KEY = 'roadguard_reports_v2_india';
const LOCAL_STORAGE_UPDATES_KEY = 'roadguard_updates_v2_india';

// Calculate distance in meters between two lat/lng coordinates (Haversine formula)
function getDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in metres
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

class ReportsService {
  /**
   * Determines whether the app should operate in Connected Mode or Demo Mode.
   */
  public isConnectedMode(): boolean {
    if (!isSupabaseConfigured || !supabase) return false;
    return localStorage.getItem('roadguard_force_demo') !== 'true';
  }

  // --------------------------------------------------------------------------
  // LOCAL DEMO STORE ACCESSORS
  // --------------------------------------------------------------------------

  private getLocalReports(): ReportRecord[] {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_REPORTS_KEY);
      if (stored) {
        const parsed: ReportRecord[] = JSON.parse(stored);
        // Ensure dynamic aging is applied
        return parsed.map(r => recalculateDynamicPriority(r));
      }
    } catch (e) {
      console.warn('Could not read demo reports from localStorage', e);
    }
    // Initialize with demo reports
    const fresh = INITIAL_DEMO_REPORTS.map(r => recalculateDynamicPriority(r));
    this.saveLocalReports(fresh);
    return fresh;
  }

  private saveLocalReports(reports: ReportRecord[]): void {
    try {
      localStorage.setItem(LOCAL_STORAGE_REPORTS_KEY, JSON.stringify(reports));
    } catch (err) {
      console.error('Failed to save demo reports to localStorage', err);
    }
  }

  private getLocalUpdates(): ReportUpdateRecord[] {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_UPDATES_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not read demo updates from localStorage', e);
    }
    localStorage.setItem(LOCAL_STORAGE_UPDATES_KEY, JSON.stringify(INITIAL_DEMO_UPDATES));
    return [...INITIAL_DEMO_UPDATES];
  }

  private saveLocalUpdates(updates: ReportUpdateRecord[]): void {
    try {
      localStorage.setItem(LOCAL_STORAGE_UPDATES_KEY, JSON.stringify(updates));
    } catch (err) {
      console.error('Failed to save demo updates to localStorage', err);
    }
  }

  // --------------------------------------------------------------------------
  // PUBLIC DATA ACCESS METHODS
  // --------------------------------------------------------------------------

  /**
   * Fetches all reports based on filters.
   * In Connected Mode: queries Supabase. If Supabase fails, throws a real error.
   * In Demo Mode: queries localStorage.
   */
  public async getAllReports(filters?: Partial<ReportFilterOptions>): Promise<ReportRecord[]> {
    if (this.isConnectedMode() && supabase) {
      let query = supabase
        .from('reports')
        .select(`
          *,
          profiles:user_id (
            full_name
          )
        `);

      if (filters?.hazardType && filters.hazardType !== 'all') {
        query = query.eq('hazard_type', filters.hazardType);
      }
      if (filters?.priorityLevel && filters.priorityLevel !== 'all') {
        query = query.eq('priority_level', filters.priorityLevel);
      }
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.sortBy === 'created_at_desc') {
        query = query.order('created_at', { ascending: false });
      } else if (filters?.sortBy === 'created_at_asc') {
        query = query.order('created_at', { ascending: true });
      } else {
        query = query.order('priority_score', { ascending: false });
      }

      const { data, error } = await query;
      if (error) {
        console.error('Supabase reports fetch error:', error);
        throw new Error(`Failed to load reports from database: ${error.message}`);
      }

      // Map joined profile and apply dynamic aging recalculation
      const mapped: ReportRecord[] = (data || []).map(row => {
        const joinedProfile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
        const record: ReportRecord = {
          ...row,
          user_name: joinedProfile?.full_name || null,
          is_demo: false
        };
        return recalculateDynamicPriority(record);
      });

      // Filter by search query if provided
      if (filters?.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        return mapped.filter(
          r =>
            r.report_code.toLowerCase().includes(q) ||
            r.location_name.toLowerCase().includes(q) ||
            r.description.toLowerCase().includes(q) ||
            r.hazard_type.toLowerCase().includes(q)
        );
      }

      return mapped;
    }

    // ---------------- DEMO MODE ----------------
    let reports = this.getLocalReports();

    if (filters) {
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        reports = reports.filter(
          r =>
            r.report_code.toLowerCase().includes(q) ||
            r.location_name.toLowerCase().includes(q) ||
            r.description.toLowerCase().includes(q) ||
            r.hazard_type.toLowerCase().includes(q)
        );
      }

      if (filters.hazardType && filters.hazardType !== 'all') {
        reports = reports.filter(r => r.hazard_type === filters.hazardType);
      }

      if (filters.priorityLevel && filters.priorityLevel !== 'all') {
        reports = reports.filter(r => r.priority_level === filters.priorityLevel);
      }

      if (filters.status && filters.status !== 'all') {
        reports = reports.filter(r => r.status === filters.status);
      }

      if (filters.sortBy === 'created_at_desc') {
        reports.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      } else if (filters.sortBy === 'created_at_asc') {
        reports.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      } else {
        reports.sort((a, b) => b.priority_score - a.priority_score);
      }
    }

    return reports;
  }

  /**
   * Fetches a single report by its UUID or human-readable Report Code (e.g. RG-2026-0012).
   */
  public async getReportByIdOrCode(idOrCode: string): Promise<ReportRecord | null> {
    const cleanQuery = idOrCode.trim();

    if (this.isConnectedMode() && supabase) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanQuery);
      let query = supabase
        .from('reports')
        .select(`
          *,
          profiles:user_id (
            full_name
          )
        `);

      if (isUuid) {
        query = query.or(`id.eq.${cleanQuery},report_code.eq.${cleanQuery.toUpperCase()}`);
      } else {
        query = query.eq('report_code', cleanQuery.toUpperCase());
      }

      const { data, error } = await query.maybeSingle();
      if (error) {
        console.error('Supabase report query error:', error);
        throw new Error(`Failed to find report: ${error.message}`);
      }

      if (!data) return null;

      const joinedProfile = Array.isArray(data.profiles) ? data.profiles[0] : data.profiles;
      const record: ReportRecord = {
        ...data,
        user_name: joinedProfile?.full_name || null,
        is_demo: false
      };
      return recalculateDynamicPriority(record);
    }

    // ---------------- DEMO MODE ----------------
    const local = this.getLocalReports();
    const upper = cleanQuery.toUpperCase();
    const found = local.find(r => r.id === cleanQuery || r.report_code.toUpperCase() === upper);
    return found ? recalculateDynamicPriority(found) : null;
  }

  /**
   * Submits a new hazard report.
   * In Connected Mode: Inserts into PostgreSQL. DB triggers generate UUID, atomic code, and initial intake log.
   * In Demo Mode: Persists to localStorage.
   */
  public async createReport(input: NewReportInput, currentUserId?: string | null): Promise<ReportRecord> {
    if (this.isConnectedMode() && supabase) {
      // 1. Calculate cluster frequency from active reports within ~150m in PostgreSQL
      // Bounding box: ~0.00135 degrees latitude ≈ 150m
      const latDelta = 0.0015;
      const lonDelta = 0.0015;

      const { data: nearbyRows } = await supabase
        .from('reports')
        .select('latitude, longitude')
        .neq('status', 'resolved')
        .gte('latitude', input.latitude - latDelta)
        .lte('latitude', input.latitude + latDelta)
        .gte('longitude', input.longitude - lonDelta)
        .lte('longitude', input.longitude + lonDelta);

      const clusterCount = (nearbyRows || []).filter(
        r => getDistanceInMeters(input.latitude, input.longitude, r.latitude, r.longitude) <= 150
      ).length;

      // 2. Deterministic Priority Engine Calculation
      const priorityResult = calculateHazardPriority({
        hazard_type: input.hazard_type,
        severity: input.severity,
        traffic_exposure: input.traffic_exposure,
        vulnerability_level: input.vulnerability_level,
        existing_cluster_count: clusterCount,
        created_at: new Date().toISOString()
      });

      const breakdown = createPriorityBreakdown({
        hazard_type: input.hazard_type,
        severity: input.severity,
        traffic_exposure: input.traffic_exposure,
        vulnerability_level: input.vulnerability_level,
        existing_cluster_count: clusterCount
      });

      // 0. Auth Session Resolution & Verification (Supabase session is the Source of Truth)
      const { data: sessionData } = await supabase.auth.getSession();
      const activeSession = sessionData?.session;
      const { data: userData } = await supabase.auth.getUser();
      const authUser = userData?.user;

      let effectiveUserId: string | null = null;

      if (authUser) {
        // Authenticated citizen: reports.user_id MUST be the authenticated user's UUID
        effectiveUserId = authUser.id;
      } else if (currentUserId) {
        // Auth session mismatch: frontend state expects an authenticated citizen, but Supabase client has no active session
        console.error('[reportsService.createReport] Auth session mismatch: currentUserId provided but no active Supabase session.', {
          currentUserId,
          hasSession: !!activeSession,
          hasAuthUser: !!authUser
        });
        throw new Error(
          'Your authentication session has expired or is not active in the database. Please sign in again before submitting a report.'
        );
      } else {
        // Unauthenticated anonymous report
        effectiveUserId = null;
      }

      console.log('[reportsService.createReport] Verified Auth State:', {
        authenticatedUserUuid: authUser?.id || null,
        reportsUserId: effectiveUserId,
        hasSession: !!activeSession,
        isAnonymous: !effectiveUserId
      });

      // 3. Database Insert Payload (Strictly matches writable columns; excludes client UUID and report_code)
      const payload: ReportInsertPayload = {
        user_id: effectiveUserId,
        hazard_type: input.hazard_type,
        location_name: input.location_name,
        latitude: input.latitude,
        longitude: input.longitude,
        description: input.description,
        severity: input.severity,
        traffic_exposure: input.traffic_exposure,
        vulnerability_level: input.vulnerability_level,
        priority_score: priorityResult.score,
        priority_level: priorityResult.level,
        priority_breakdown: breakdown,
        status: 'submitted',
        image_url: input.image_preview || null,
        ai_suggestion: input.ai_suggestion || null
      };

      console.log('[reportsService.createReport] Submitting report payload:', payload);

      const { data, error } = await supabase
        .from('reports')
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.error('Supabase report insert error:', error);
        throw new Error(`Database error saving report: ${error.message}`);
      }

      return {
        ...data,
        is_demo: false
      } as ReportRecord;
    }

    // ---------------- DEMO MODE ----------------
    const existingReports = this.getLocalReports();

    const clusterCount = existingReports.filter(
      r =>
        r.status !== 'resolved' &&
        getDistanceInMeters(input.latitude, input.longitude, r.latitude, r.longitude) <= 150
    ).length;

    const priorityResult = calculateHazardPriority({
      hazard_type: input.hazard_type,
      severity: input.severity,
      traffic_exposure: input.traffic_exposure,
      vulnerability_level: input.vulnerability_level,
      existing_cluster_count: clusterCount,
      created_at: new Date().toISOString()
    });

    const breakdown = createPriorityBreakdown({
      hazard_type: input.hazard_type,
      severity: input.severity,
      traffic_exposure: input.traffic_exposure,
      vulnerability_level: input.vulnerability_level,
      existing_cluster_count: clusterCount
    });

    // Generate unique demo code
    const nextSeq = existingReports.length + 101;
    const reportCode = `RG-2026-${String(nextSeq).padStart(4, '0')}`;
    const newId = `demo-${Date.now()}`;
    const now = new Date().toISOString();

    const record: ReportRecord = {
      id: newId,
      report_code: reportCode,
      user_id: currentUserId || 'demo-citizen-id',
      user_name: input.user_name || 'Citizen Reporter',
      hazard_type: input.hazard_type,
      location_name: input.location_name,
      latitude: input.latitude,
      longitude: input.longitude,
      description: input.description,
      severity: input.severity,
      traffic_exposure: input.traffic_exposure,
      vulnerability_level: input.vulnerability_level,
      priority_score: priorityResult.score,
      priority_level: priorityResult.level,
      priority_breakdown: breakdown,
      status: 'submitted',
      image_url: input.image_preview || null,
      ai_suggestion: input.ai_suggestion || null,
      created_at: now,
      updated_at: now,
      resolved_at: null,
      is_demo: true
    };

    const updatedList = [record, ...existingReports];
    this.saveLocalReports(updatedList);

    // Initial audit entry
    const initialUpdate: ReportUpdateRecord = {
      id: `upd-${Date.now()}`,
      report_id: record.id,
      admin_id: null,
      admin_name: 'Municipal Intake System',
      department: 'Triage Queue',
      previous_status: null,
      new_status: 'submitted',
      comment: `Hazard report registered in municipal triage intake. Priority calculated as ${record.priority_level.toUpperCase()} (${record.priority_score}/100).`,
      created_at: now
    };
    const currentUpdates = this.getLocalUpdates();
    this.saveLocalUpdates([initialUpdate, ...currentUpdates]);

    return record;
  }

  /**
   * Updates report status and appends to administrative audit history.
   * In Connected Mode: updates report and inserts audit record into PostgreSQL.
   */
  public async updateReportStatus(
    reportId: string,
    newStatus: ReportStatus,
    comment: string,
    adminUser?: { id: string; name: string; department?: string | null }
  ): Promise<ReportRecord> {
    const now = new Date().toISOString();

    if (this.isConnectedMode() && supabase) {
      const resolvedAt = newStatus === 'resolved' ? now : null;

      // 1. Update report in database
      const { data: updatedReport, error: updateError } = await supabase
        .from('reports')
        .update({
          status: newStatus,
          updated_at: now,
          resolved_at: resolvedAt
        })
        .eq('id', reportId)
        .select()
        .single();

      if (updateError) {
        console.error('Supabase status update error:', updateError);
        throw new Error(`Failed to update status: ${updateError.message}`);
      }

      // 2. Insert audit log record
      const updatePayload: ReportUpdateInsertPayload = {
        report_id: reportId,
        admin_id: adminUser?.id || null,
        previous_status: null, // PostgreSQL trigger or application state
        new_status: newStatus,
        comment: comment.trim()
      };

      const { error: insertError } = await supabase
        .from('report_updates')
        .insert([updatePayload]);

      if (insertError) {
        console.warn('Audit trail insert error:', insertError);
        // Note: report status was updated, but audit log insert failed
      }

      return {
        ...updatedReport,
        is_demo: false
      } as ReportRecord;
    }

    // ---------------- DEMO MODE ----------------
    const existingReports = this.getLocalReports();
    const index = existingReports.findIndex(r => r.id === reportId);
    if (index === -1) {
      throw new Error(`Report ${reportId} not found in demo records.`);
    }

    const current = existingReports[index];
    const previousStatus = current.status;

    const updatedRecord: ReportRecord = {
      ...current,
      status: newStatus,
      updated_at: now,
      resolved_at: newStatus === 'resolved' ? now : current.resolved_at
    };

    existingReports[index] = updatedRecord;
    this.saveLocalReports(existingReports);

    const auditRecord: ReportUpdateRecord = {
      id: `upd-${Date.now()}`,
      report_id: reportId,
      admin_id: adminUser?.id || 'demo-admin-id',
      admin_name: adminUser?.name || 'Demo Authority User',
      department: adminUser?.department || 'Municipal Road Maintenance Team',
      previous_status: previousStatus,
      new_status: newStatus,
      comment: comment.trim(),
      created_at: now
    };

    const updates = this.getLocalUpdates();
    this.saveLocalUpdates([auditRecord, ...updates]);

    return updatedRecord;
  }

  /**
   * Fetches chronological audit trail for a report.
   */
  public async getReportUpdates(reportId: string): Promise<ReportUpdateRecord[]> {
    if (this.isConnectedMode() && supabase) {
      const { data, error } = await supabase
        .from('report_updates')
        .select(`
          *,
          profiles:admin_id (
            full_name,
            department
          )
        `)
        .eq('report_id', reportId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Supabase audit updates error:', error);
        throw new Error(`Failed to load audit trail: ${error.message}`);
      }

      return (data || []).map(row => {
        const joinedProfile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
        return {
          id: row.id,
          report_id: row.report_id,
          admin_id: row.admin_id,
          admin_name: joinedProfile?.full_name || 'Municipal Intake System',
          department: joinedProfile?.department || 'Triage Dispatch',
          previous_status: row.previous_status,
          new_status: row.new_status,
          comment: row.comment,
          created_at: row.created_at
        };
      });
    }

    // ---------------- DEMO MODE ----------------
    const updates = this.getLocalUpdates();
    return updates
      .filter(u => u.report_id === reportId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  /**
   * Resets local demonstration data to curated Karnataka demo set.
   */
  public resetDemoData(): void {
    localStorage.setItem(LOCAL_STORAGE_REPORTS_KEY, JSON.stringify(INITIAL_DEMO_REPORTS));
    localStorage.setItem(LOCAL_STORAGE_UPDATES_KEY, JSON.stringify(INITIAL_DEMO_UPDATES));
  }
}

export const reportsService = new ReportsService();
