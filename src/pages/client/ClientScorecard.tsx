import React from 'react';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useParams } from 'react-router-dom';

const Card = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
    <div className={`bg-white rounded-xl shadow-md p-6 ${className}`}>{children}</div>
);

const ClientScorecard = () => {
    const { clientId } = useParams<{ clientId: string }>();
    const [loading, setLoading] = useState(true);
    const [projects, setProjects] = useState<any[]>([]);
    const [ngos, setNgos] = useState<any[]>([]);
    const [targets, setTargets] = useState<any[]>([]);
    const [progressUpdates, setProgressUpdates] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            if (!clientId) return;
            setLoading(true);
            try {
                const { data: projectData, error: projectError } = await supabase
                    .from('projects')
                    .select('id, ngo_id, title, ngos(id, name)')
                    .eq('client_id', clientId);
                
                if(projectError) throw projectError;
                setProjects(projectData || []);

                // Correctly create a unique list of partner NGOs
                const partnerNgos = Array.from(
                    new Map(
                        projectData
                            ?.map(p => p.ngos)
                            .filter(Boolean)
                            .map((ngo: any) => [ngo.id, ngo])
                    ).values()
                );
                setNgos(partnerNgos);

                const projectIds = projectData?.map(p => p.id) || [];
                if (projectIds.length > 0) {
                    const [targetsRes, progressRes] = await Promise.all([
                        supabase.from('project_metrics').select('*').in('project_id', projectIds),
                        supabase.from('quarterly_progress').select('*').in('project_id', projectIds),
                    ]);
                    setTargets(targetsRes.data || []);
                    setProgressUpdates(progressRes.data || []);
                }
            } catch (error) {
                console.error("Error fetching scorecard data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [clientId]);

    if (loading) return <div className="p-8 text-center">Loading Scorecard...</div>;

    return (
        <div className="p-6 md:p-8 space-y-8 bg-gray-50 min-h-full">
            <header>
                <h1 className="text-3xl font-bold text-gray-800">Project Scorecard</h1>
                <p className="text-gray-600">Detailed progress of all project metrics, grouped by NGO.</p>
            </header>
            <div className="space-y-6">
                {ngos.map(ngo => {
                    const ngoProjects = projects.filter(p => p.ngo_id === ngo.id);
                    return (
                        <Card key={ngo.id}>
                            <h3 className="text-xl font-bold mb-4 text-emerald-700">{ngo.name} - Project Scorecard</h3>
                            {ngoProjects.map(project => {
                                const projectTargets = targets.filter(t => t.project_id === project.id);
                                return (
                                    <div key={project.id} className="mb-6 last:mb-0 p-4 border rounded-lg bg-gray-50">
                                        <h4 className="font-semibold text-lg text-gray-800">{project.title}</h4>
                                        <div className="overflow-x-auto mt-2">
                                            <table className="w-full text-left text-sm">
                                                <thead className="bg-white text-gray-600">
                                                    <tr>
                                                        <th className="p-2">Metric</th>
                                                        <th className="p-2 text-right">Target</th>
                                                        <th className="p-2 text-right">Achieved</th>
                                                        <th className="p-2 text-right">Progress</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {projectTargets.map(target => {
                                                        const progress = progressUpdates
                                                            .filter(p => p.metric_id === target.id)
                                                            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
                                                        
                                                        const achieved = progress?.achieved_value || 0;
                                                        const percentage = target.target_value > 0 ? Math.round((achieved / target.target_value) * 100) : 0;
                                                        return (
                                                            <tr key={target.id} className="border-b">
                                                                <td className="p-2 font-medium">{target.metric_name}</td>
                                                                <td className="p-2 text-right">{target.target_value.toLocaleString()} {target.unit}</td>
                                                                <td className="p-2 text-right">{achieved.toLocaleString()} {target.unit}</td>
                                                                <td className="p-2 font-bold text-right" style={{ color: percentage >= 80 ? '#16a34a' : '#f97316' }}>{percentage}%</td>
                                                            </tr>
                                                        )
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )
                            })}
                        </Card>
                    )
                })}
            </div>
        </div>
    );
};

export default ClientScorecard;

