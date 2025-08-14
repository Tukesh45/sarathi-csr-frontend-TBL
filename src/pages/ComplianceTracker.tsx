import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

const ComplianceTracker: React.FC = () => {
  const [role, setRole] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [orgType, setOrgType] = useState<'ngo'|'client'|null>(null);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [requirements, setRequirements] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setMessage('');
      try {
        const { data: sessionRes } = await supabase.auth.getSession();
        const uid = sessionRes?.session?.user?.id || '';
        setUserId(uid);
        if (!uid) { setLoading(false); return; }
        const { data: prof } = await supabase.from('profiles').select('role').eq('id', uid).single();
        const r = prof?.role || '';
        setRole(r);
        const oType = r === 'ngo' ? 'ngo' : r === 'client' ? 'client' : null;
        setOrgType(oType);
        if (!oType) { setLoading(false); return; }
        // resolve orgId via my_*_compliance views
        const view = oType === 'ngo' ? 'my_ngo_compliance' : 'my_client_compliance';
        const { data: rows } = await supabase.from(view).select('*');
        const first = rows && rows[0];
        const oid = oType === 'ngo' ? first?.ngo_id : first?.client_id;
        setOrgId(oid || null);
        // load requirements and submissions
        const { data: reqs } = await supabase
          .from('compliance_master')
          .select('*')
          .eq('org_type', oType)
          .eq('is_active', true)
          .order('requirement_name', { ascending: true });
        setRequirements(reqs || []);
        if (oid) {
          const { data: subs } = await supabase
            .from('compliance_submissions')
            .select('*')
            .eq('org_type', oType)
            .eq('org_id', oid);
          setSubmissions(subs || []);
        }
      } catch (e: any) {
        setMessage(e?.message || 'Error loading compliance');
      }
      setLoading(false);
    };
    init();
  }, []);

  const joined = useMemo(() => {
    const byReq: Record<string, any> = {};
    submissions.forEach(s => { byReq[s.requirement_id] = s; });
    return requirements.map(r => ({ requirement: r, submission: byReq[r.id] }));
  }, [requirements, submissions]);

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <h2>Compliance Tracker</h2>
        <div style={{ color: '#6b7280' }}>{role && orgType ? `${orgType.toUpperCase()} view` : 'Admin view'}</div>
      </div>
      {loading && <div>Loading...</div>}
      {message && <div className="form-feedback" style={{ color: '#dc2626' }}>{message}</div>}
      {!loading && joined.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-illustration">📄</div>
          <div className="mb-2 font-bold">No compliance items</div>
          <div>Nothing to show yet.</div>
        </div>
      )}
      {joined.length > 0 && (
        <table className="table">
          <thead>
            <tr>
              <th>Requirement</th>
              <th>Status</th>
              <th>File</th>
            </tr>
          </thead>
          <tbody>
            {joined.map(({ requirement, submission }) => (
              <tr key={requirement.id}>
                <td>{requirement.requirement_name}</td>
                <td>{submission ? submission.status : 'missing'}</td>
                <td>
                  {submission?.file_url ? (
                    <a href={submission.file_url} target="_blank" rel="noopener noreferrer">View</a>
                  ) : (
                    <span>-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ComplianceTracker; 