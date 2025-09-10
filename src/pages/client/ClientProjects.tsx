import React from 'react';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useParams } from 'react-router-dom';

const Card = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
    <div className={`bg-white rounded-xl shadow-md p-6 ${className}`}>{children}</div>
);

const ClientProjects = () => {
    const { clientId } = useParams<{ clientId: string }>();
    const [loading, setLoading] = useState(true);
    const [projects, setProjects] = useState<any[]>([]);
    const [budgets, setBudgets] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            if (!clientId) return;
            setLoading(true);
            try {
                const { data: projectData } = await supabase.from('projects').select('id, title, ngos(name)').eq('client_id', clientId);
                setProjects(projectData || []);

                const projectIds = projectData?.map(p => p.id) || [];
                if (projectIds.length > 0) {
                    const { data: budgetData } = await supabase.from('budget_allocations').select('*').in('project_id', projectIds);
                    setBudgets(budgetData || []);
                }
            } catch (error) {
                console.error("Error fetching project details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [clientId]);
    
    if (loading) return <div className="p-8">Loading Project Details...</div>;

    return (
        <div className="p-6 md:p-8 space-y-8 bg-gray-50 min-h-full">
             <header>
                <h1 className="text-3xl font-bold text-gray-800">Project Details</h1>
                <p className="text-gray-600">Quarterly funding details for all your projects.</p>
            </header>
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-xs text-gray-700 uppercase">
                            <tr>
                                <th className="p-3">Project</th>
                                <th className="p-3">NGO</th>
                                <th className="p-3 text-right">Q1 Budget</th>
                                <th className="p-3 text-right">Q2 Budget</th>
                                <th className="p-3 text-right">Q3 Budget</th>
                                <th className="p-3 text-right">Q4 Budget</th>
                                <th className="p-3 text-right">Total Budget</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projects.map((project) => {
                                const budget = budgets.find(b => b.project_id === project.id);
                                return (
                                    <tr key={project.id} className="border-b hover:bg-gray-50">
                                        <td className="p-3 font-medium text-gray-900">{project.title}</td>
                                        <td className="p-3 text-gray-600">{project.ngos.name}</td>
                                        <td className="p-3 text-right">₹{budget?.q1_budget?.toLocaleString() || 0}</td>
                                        <td className="p-3 text-right">₹{budget?.q2_budget?.toLocaleString() || 0}</td>
                                        <td className="p-3 text-right">₹{budget?.q3_budget?.toLocaleString() || 0}</td>
                                        <td className="p-3 text-right">₹{budget?.q4_budget?.toLocaleString() || 0}</td>
                                        <td className="p-3 font-semibold text-right">₹{budget?.total_budget?.toLocaleString() || 0}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default ClientProjects;
