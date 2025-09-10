import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { useParams } from 'react-router-dom';

const Card = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
    <div className={`bg-white rounded-xl shadow-md p-6 ${className}`}>{children}</div>
);

const ClientBudget = () => {
    const { clientId } = useParams<{ clientId: string }>();
    const [loading, setLoading] = useState(true);
    const [projects, setProjects] = useState<any[]>([]);
    const [budgets, setBudgets] = useState<any[]>([]);
    const [ngos, setNgos] = useState<any[]>([]);
    const [feedback, setFeedback] = useState('');

    const fetchData = async () => {
        if (!clientId) return;
        try {
            const { data: projectData } = await supabase.from('projects').select('*, ngos(*)').eq('client_id', clientId);
            setProjects(projectData || []);
            const partnerNgos = Array.from(new Map(projectData?.map(p => p.ngos).filter(Boolean).map((ngo: any) => [ngo.id, ngo])).values());
            setNgos(partnerNgos);

            const projectIds = projectData?.map(p => p.id) || [];
            if (projectIds.length > 0) {
                const { data: budgetData } = await supabase.from('budget_allocations').select('*').in('project_id', projectIds);
                setBudgets(budgetData || []);
            }
        } catch (error) { console.error("Error fetching budget data:", error); }
    };

    useEffect(() => {
        const initialFetch = async () => {
            setLoading(true);
            await fetchData();
            setLoading(false);
        };
        initialFetch();
    }, [clientId]);

    const handleBudgetChange = (projectId: string, field: string, value: string) => {
        const numericValue = parseFloat(value) || 0;
        setBudgets(currentBudgets => {
            const existingBudgetIndex = currentBudgets.findIndex(b => b.project_id === projectId);
            let newBudgets = [...currentBudgets];
            
            if (existingBudgetIndex > -1) {
                newBudgets[existingBudgetIndex] = { ...newBudgets[existingBudgetIndex], [field]: numericValue };
            } else {
                newBudgets.push({ project_id: projectId, total_budget: 0, q1_budget: 0, q2_budget: 0, q3_budget: 0, q4_budget: 0, [field]: numericValue });
            }

            // Recalculate total if a quarterly budget was changed
            const budgetToUpdate = newBudgets.find(b => b.project_id === projectId);
            if(budgetToUpdate && field !== 'total_budget') {
                budgetToUpdate.total_budget = (budgetToUpdate.q1_budget || 0) + (budgetToUpdate.q2_budget || 0) + (budgetToUpdate.q3_budget || 0) + (budgetToUpdate.q4_budget || 0);
            }
            return newBudgets;
        });
    };

    const handleSaveBudgets = async () => {
        setFeedback('Saving...');
        try {
            const budgetsToSave = budgets.filter(b => projects.some(p => p.id === b.project_id));
            if (budgetsToSave.length === 0) {
                 setFeedback('No budget changes to save.');
                 setTimeout(() => setFeedback(''), 2000);
                 return;
            }

            const { error } = await supabase.from('budget_allocations').upsert(budgetsToSave, { onConflict: 'project_id' });
            if (error) throw error;
            
            setFeedback('Budgets saved successfully!');
        } catch (error) {
            console.error("Error saving budgets:", error);
            setFeedback('Failed to save budgets.');
        }
        setTimeout(() => setFeedback(''), 3000);
    };

    const projectsByNgo = useMemo(() => {
        return ngos.map(ngo => ({
            ...ngo,
            projects: projects.filter(p => p.ngo_id === ngo.id)
        }));
    }, [ngos, projects]);

    if (loading) return <div className="p-8 text-center">Loading Budget Tracker...</div>;

    return (
        <div className="p-6 md:p-8 space-y-8 bg-gray-50 min-h-full">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Budget Tracker & Allocation</h1>
                    <p className="text-gray-600">Allocate your CSR budget across projects and quarters in real-time.</p>
                </div>
                <div>
                    <button className="btn btn-success" onClick={handleSaveBudgets}>Save All Changes</button>
                    {feedback && <span className="text-sm ml-4 font-medium">{feedback}</span>}
                </div>
            </header>

            <div className="space-y-6">
                {projectsByNgo.map(ngo => (
                    <Card key={ngo.id}>
                        <h2 className="text-xl font-bold mb-4 text-emerald-700">{ngo.name}</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-600">
                                    <tr>
                                        <th className="p-2">Project</th>
                                        <th className="p-2 text-right">Q1 Budget (₹)</th>
                                        <th className="p-2 text-right">Q2 Budget (₹)</th>
                                        <th className="p-2 text-right">Q3 Budget (₹)</th>
                                        <th className="p-2 text-right">Q4 Budget (₹)</th>
                                        <th className="p-2 text-right font-bold">Total Budget (₹)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ngo.projects.map((project: any) => {
                                        const budget = budgets.find(b => b.project_id === project.id) || {};
                                        return (
                                            <tr key={project.id} className="border-b">
                                                <td className="p-2 font-medium">{project.title}</td>
                                                {['q1_budget', 'q2_budget', 'q3_budget', 'q4_budget'].map(field => (
                                                    <td key={field} className="p-2 text-right">
                                                        <input 
                                                            type="text"
                                                            value={budget[field] || ''}
                                                            onChange={e => handleBudgetChange(project.id, field, e.target.value)}
                                                            className="w-24 text-right p-1 border rounded"
                                                        />
                                                    </td>
                                                ))}
                                                 <td className="p-2 text-right font-bold">
                                                    ₹{budget.total_budget?.toLocaleString() || 0}
                                                 </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default ClientBudget;

