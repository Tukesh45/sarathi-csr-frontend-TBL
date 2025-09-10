import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useParams } from 'react-router-dom';

// --- Reusable UI Components for a beautiful and consistent look ---
const Card = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
    <div className={`bg-white rounded-xl shadow-md p-6 ${className}`}>{children}</div>
);

const DonutChart = ({ title, value, total, color, unit = '₹' }: { title: string, value: number, total: number, color: string, unit?: string }) => {
    const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <Card className="flex flex-col items-center justify-center text-center">
            <div className="relative w-32 h-32">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                    <circle
                        cx="50" cy="50" r="45" fill="none" stroke={color} strokeWidth="10"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        transform="rotate(-90 50 50)"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold" style={{ color }}>
                    {percentage}%
                </div>
            </div>
            <div className="mt-4">
                <div className="text-gray-500 text-sm font-medium uppercase tracking-wider">{title}</div>
                <div className="text-xl font-bold text-gray-800">{unit}{value.toLocaleString()}</div>
                <div className="text-xs text-gray-400">of {unit}{total.toLocaleString()}</div>
            </div>
        </Card>
    );
};

const ClientDashboard: React.FC<{ user: any }> = ({ user }) => {
    const { clientId } = useParams<{ clientId: string }>();
    const [loading, setLoading] = useState(true);
    const [client, setClient] = useState<any>(null);
    const [projects, setProjects] = useState<any[]>([]);
    const [budgets, setBudgets] = useState<any[]>([]);
    const [progressUpdates, setProgressUpdates] = useState<any[]>([]);
    const [metrics, setMetrics] = useState<any[]>([]);

    useEffect(() => {
        const fetchDataForClient = async () => {
            if (!clientId) return;
            setLoading(true);
            try {
                const { data: clientData } = await supabase.from('clients').select('*').eq('id', clientId).single();
                setClient(clientData);

                const { data: projectData } = await supabase.from('projects').select('*').eq('client_id', clientId);
                setProjects(projectData || []);

                const projectIds = projectData?.map(p => p.id) || [];
                if (projectIds.length > 0) {
                    const [budgetsRes, progressRes, metricsRes] = await Promise.all([
                        supabase.from('budget_allocations').select('*').in('project_id', projectIds),
                        supabase.from('quarterly_progress').select('*').in('project_id', projectIds),
                        supabase.from('project_metrics').select('*').in('project_id', projectIds)
                    ]);
                    setBudgets(budgetsRes.data || []);
                    setProgressUpdates(progressRes.data || []);
                    setMetrics(metricsRes.data || []);
                }
            } catch (error) {
                console.error("Failed to fetch client dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDataForClient();
    }, [clientId]);

    const totalCsrBudget = useMemo(() => client?.annual_csr_budget || 0, [client]);
    const totalAllocated = useMemo(() => budgets.reduce((sum, b) => sum + (b.total_budget || 0), 0), [budgets]);
    const totalSpent = useMemo(() => progressUpdates.reduce((sum, p) => sum + (p.achieved_value || 0), 0), [progressUpdates]); // Simplified; assumes achieved_value is money
    
    const overallProgress = useMemo(() => {
        const totalTarget = metrics.reduce((sum, m) => sum + (m.target_value || 0), 0);
        const totalAchieved = progressUpdates.reduce((sum, p) => sum + (p.achieved_value || 0), 0);
        return totalTarget > 0 ? (totalAchieved / totalTarget) * 100 : 0;
    }, [metrics, progressUpdates]);

    if (loading) return <div className="p-8 text-center">Loading Dashboard...</div>;

    return (
        <div className="p-6 md:p-8 space-y-8 bg-gray-50 min-h-full">
            <header>
                <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>
                <p className="text-gray-600">Welcome, {client?.company_name || user.email}. Here is your real-time CSR portfolio summary.</p>
            </header>

            <section>
                <h2 className="text-xl font-bold text-gray-700 mb-4">Budget Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <DonutChart title="Total Budget Utilized" value={totalAllocated} total={totalCsrBudget} color="#2563eb" />
                    <DonutChart title="Allocated Budget Spent" value={totalSpent} total={totalAllocated} color="#16a34a" />
                </div>
            </section>

             <section>
                <h2 className="text-xl font-bold text-gray-700 mb-4">Project Progress</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                   <Card>
                       <h3 className="font-semibold text-gray-600">Overall Project Completion</h3>
                       <p className="text-4xl font-bold text-emerald-600 mt-2">{overallProgress.toFixed(0)}%</p>
                   </Card>
                   <Card>
                       <h3 className="font-semibold text-gray-600">Total Project Costs</h3>
                       <p className="text-4xl font-bold text-gray-800 mt-2">₹{totalAllocated.toLocaleString()}</p>
                   </Card>
                    <Card>
                       <h3 className="font-semibold text-gray-600">Total Spent by Projects</h3>
                       <p className="text-4xl font-bold text-gray-800 mt-2">₹{totalSpent.toLocaleString()}</p>
                   </Card>
                </div>
            </section>
        </div>
    );
};

export default ClientDashboard;

