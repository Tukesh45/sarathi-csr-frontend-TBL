import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

interface ComplianceGateProps {
  user: any;
  role: string | null;
}

interface ComplianceMasterItem {
  id: string;
  org_type: 'ngo' | 'client';
  requirement_name: string;
  is_active: boolean;
}

interface SubmissionItem {
  id: string;
  org_type: 'ngo' | 'client';
  org_id: string;
  requirement_id: string;
  file_url: string | null;
  status: 'submitted' | 'approved' | 'rejected';
}

const ComplianceGate: React.FC<ComplianceGateProps> = ({ user, role }) => {
  const [loading, setLoading] = useState(false);
  const [showGate, setShowGate] = useState(false);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [requirements, setRequirements] = useState<ComplianceMasterItem[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [pendingUrls, setPendingUrls] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string>('');

  const orgType: 'ngo' | 'client' | null = useMemo(() => {
    if (role === 'ngo') return 'ngo';
    if (role === 'client') return 'client';
    return null;
  }, [role]);

  const joined = useMemo(() => {
    const byReq: Record<string, SubmissionItem | undefined> = {};
    submissions.forEach(s => { byReq[s.requirement_id] = s; });
    return requirements.map(r => ({
      requirement: r,
      submission: byReq[r.id],
    }));
  }, [requirements, submissions]);

  const isComplete = useMemo(() => {
    if (!requirements.length) return true;
    // v1 rule: fully filled means each required item has at least a submission row (any status)
    const submittedCount = joined.filter(j => !!j.submission).length;
    return submittedCount >= requirements.length;
  }, [requirements, joined]);

  useEffect(() => {
    if (!orgType || !user?.id) return;
    const init = async () => {
      setLoading(true);
      setMessage('');
      try {
        // 1) find my org id(s) and completion status via views
        const view = orgType === 'ngo' ? 'my_ngo_compliance' : 'my_client_compliance';
        const { data: statusRows, error: sErr } = await supabase.from(view).select('*');
        if (sErr) {
          console.error('Compliance status error:', sErr);
        }

        // choose first incomplete org; if none incomplete but any rows, choose first
        let pickedOrgId: string | null = null;
        if (statusRows && statusRows.length > 0) {
          const incomplete = statusRows.find((r: any) => r.is_complete === false);
          pickedOrgId = (incomplete ? (orgType === 'ngo' ? incomplete.ngo_id : incomplete.client_id) : (orgType === 'ngo' ? statusRows[0].ngo_id : statusRows[0].client_id)) || null;
        }

        // If user has no org association, don't gate
        if (!pickedOrgId) {
          setOrgId(null);
          setShowGate(false);
          setRequirements([]);
          setSubmissions([]);
          setLoading(false);
          return;
        }

        setOrgId(pickedOrgId);

        // 2) load master requirements for this org type
        const { data: reqs, error: rErr } = await supabase
          .from('compliance_master')
          .select('*')
          .eq('org_type', orgType)
          .eq('is_active', true)
          .order('requirement_name', { ascending: true });
        if (rErr) throw rErr;
        setRequirements(reqs || []);

        // 3) load existing submissions for this org
                  const { data: subs, error: subErr } = await supabase
          .from('compliance_submissions')
          .select('*')
          .eq('org_type', orgType)
          .eq('org_id', pickedOrgId);
        if (subErr) throw subErr;
        setSubmissions(subs || []);
      } catch (e: any) {
        console.error('Compliance fetch error:', e);
        setMessage(e?.message || 'Error loading compliance');
      }
      setLoading(false);
    };
    init();
  }, [orgType, user?.id]);

  useEffect(() => {
    if (!orgType || role === 'admin') {
      setShowGate(false);
      return;
    }
    // Gate when not complete and orgId exists
    setShowGate(!!orgId && !isComplete);
  }, [orgType, role, isComplete, orgId]);

  const handleSubmit = async (requirementId: string) => {
    if (!orgType || !orgId) return;
    const url = (pendingUrls[requirementId] || '').trim();
    if (!url) {
      setMessage('Please enter a file URL');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const { error } = await supabase.from('compliance_submissions').upsert({
        org_type: orgType,
        org_id: orgId,
        requirement_id: requirementId,
        file_url: url,
        status: 'submitted',
        submitted_by: user.id,
      }, { onConflict: 'org_type,org_id,requirement_id' });
      if (error) throw error;
      // refresh submissions
      const { data: subs } = await supabase
        .from('compliance_submissions')
        .select('*')
        .eq('org_type', orgType)
        .eq('org_id', orgId);
      setSubmissions(subs || []);
      setPendingUrls(prev => ({ ...prev, [requirementId]: '' }));
    } catch (e: any) {
      setMessage(e?.message || 'Error submitting');
    }
    setLoading(false);
  };

  if (!showGate) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', zIndex: 3000,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: '#fff', borderRadius: 12, padding: 24,
        maxWidth: 720, width: '95%', maxHeight: '85vh', overflow: 'auto',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
      }}>
        <div style={{ marginBottom: 12 }}>
          <h3 style={{ margin: 0 }}>Compliance Requirements</h3>
          <div style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>
            Please complete the required {orgType?.toUpperCase()} compliance items below before proceeding.
          </div>
        </div>

        {loading && <div style={{ marginBottom: 12 }}>Loading...</div>}
        {message && <div style={{ color: '#dc2626', marginBottom: 12 }}>{message}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
          {joined.map(({ requirement, submission }) => (
            <div key={requirement.id} style={{
              border: '1px solid #e5e7eb', borderRadius: 8, padding: 12,
              background: submission ? '#f8fafc' : '#fff'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{requirement.requirement_name}</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>
                    Status: {submission ? submission.status : 'missing'}
                  </div>
                </div>
                {submission?.file_url && (
                  <a href={submission.file_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12 }}>
                    View
                  </a>
                )}
              </div>
              {!submission && (
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <input
                    type="url"
                    placeholder="File URL"
                    value={pendingUrls[requirement.id] || ''}
                    onChange={(e) => setPendingUrls(prev => ({ ...prev, [requirement.id]: e.target.value }))}
                    style={{ flex: 1, padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6 }}
                  />
                  <button
                    className="btn btn-primary"
                    onClick={() => handleSubmit(requirement.id)}
                    disabled={loading}
                  >
                    Submit
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16, gap: 8 }}>
          <button
            className="btn btn-secondary"
            onClick={async () => {
              // refresh status
              setLoading(true);
              try {
                if (!orgType || !orgId) return;
                const { data: subs } = await supabase
                  .from('compliance_submissions')
                  .select('*')
                  .eq('org_type', orgType)
                  .eq('org_id', orgId);
                setSubmissions(subs || []);
              } finally {
                setLoading(false);
              }
            }}
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComplianceGate; 