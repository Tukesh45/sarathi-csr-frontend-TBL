import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { useParams } from 'react-router-dom';

// --- Helper Component: ScorecardGauge (defined in the same file) ---
interface ScorecardGaugeProps {
  title: string;
  percentage: number;
  achieved: number;
  target: number;
  isLarge?: boolean;
}

const ScorecardGauge: React.FC<ScorecardGaugeProps> = ({ title, percentage, achieved, target, isLarge = false }) => {
  const radius = isLarge ? 80 : 60;
  const stroke = isLarge ? 12 : 10;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  const visualPercentage = Math.min(percentage, 100);
  const strokeDashoffset = circumference - (visualPercentage / 100) * circumference;

  const getColor = () => {
    if (percentage >= 100) return 'text-green-500';
    if (percentage >= 70) return 'text-emerald-500';
    return 'text-orange-500';
  };

  const colorClass = getColor();
  
  return (
    <div className={`bg-white rounded-xl shadow-md p-4 flex flex-col items-center justify-between text-center ${isLarge ? 'col-span-2' : 'col-span-1'}`}>
      <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
      <div className="relative my-2">
        <svg height={radius * 2} width={radius * 2} className="-rotate-90">
          <circle stroke="currentColor" className="text-gray-200" fill="transparent" strokeWidth={stroke} r={normalizedRadius} cx={radius} cy={radius} />
          <circle stroke="currentColor" className={colorClass} fill="transparent" strokeWidth={stroke} strokeDasharray={circumference + ' ' + circumference} style={{ strokeDashoffset, strokeLinecap: 'round' }} r={normalizedRadius} cx={radius} cy={radius} />
        </svg>
        <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
          <span className={`font-bold ${isLarge ? 'text-4xl' : 'text-3xl'} ${colorClass}`}>{Math.round(percentage)}%</span>
          {isLarge && <span className="text-sm text-gray-500">Achieved</span>}
        </div>
      </div>
      <div className="text-center">
        <p className="text-xl font-medium text-gray-800">{achieved.toLocaleString()}</p>
        <p className="text-sm text-gray-500">of {target.toLocaleString()}</p>
      </div>
    </div>
  );
};

// --- Card component for the project breakdown ---
const Card = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
    <div className={`bg-white rounded-xl shadow-md p-6 ${className}`}>{children}</div>
);


// --- Main Component: ClientScorecard ---
const ClientScorecard = () => {
    const { clientId } = useParams<{ clientId: string }>();
    const [loading, setLoading] = useState(true);
    const [projects, setProjects] = useState<any[]>([]);
    const [targets, setTargets] = useState<any[]>([]);
    const [progressUpdates, setProgressUpdates] = useState<any[]>([]);
    const [expenditures, setExpenditures] = useState<any[]>([]);
    const [allocations, setAllocations] = useState<any[]>([]);
    const [budgetData, setBudgetData] = useState({ totalBudget: 0, totalSpent: 0 });

    useEffect(() => {
        const fetchData = async () => {
            if (!clientId) return;
            setLoading(true);
            try {
                const { data: projectData, error: projectError } = await supabase
                    .from('projects')
                    .select('id, title')
                    .eq('client_id', clientId);
                if (projectError) throw projectError;
                setProjects(projectData || []);

                const projectIds = projectData?.map(p => p.id) || [];
                
                const { data: clientRes, error: clientError } = await supabase
                    .from('clients').select('annual_csr_budget').eq('id', clientId).single();
                if (clientError) throw clientError;

                if (projectIds.length > 0) {
                    const [targetsRes, progressRes, expendituresRes, allocationsRes] = await Promise.all([
                        supabase.from('project_metrics').select('*').in('project_id', projectIds),
                        supabase.from('quarterly_progress').select('*').in('project_id', projectIds),
                        supabase.from('project_expenditures').select('project_id, expenditure_amount').in('project_id', projectIds),
                        supabase.from('budget_allocations').select('project_id, total_budget').in('project_id', projectIds),
                    ]);

                    setTargets(targetsRes.data || []);
                    setProgressUpdates(progressRes.data || []);
                    setExpenditures(expendituresRes.data || []);
                    setAllocations(allocationsRes.data || []);
                    
                    const totalBudget = clientRes?.annual_csr_budget || 0;
                    const totalSpent = expendituresRes.data?.reduce((sum, item) => sum + item.expenditure_amount, 0) || 0;
                    
                    setBudgetData({ totalBudget, totalSpent });
                } else {
                    const totalBudget = clientRes?.annual_csr_budget || 0;
                    setBudgetData({ totalBudget, totalSpent: 0 });
                }
            } catch (error) {
                console.error("Error fetching scorecard data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [clientId]);

    const aggregatedMetrics = useMemo(() => {
        const metricsMap = new Map();
        targets.forEach(target => {
            const totalAchieved = progressUpdates.filter(p => p.metric_id === target.id).reduce((sum, p) => sum + p.achieved_value, 0);
            if (!metricsMap.has(target.metric_name)) {
                metricsMap.set(target.metric_name, { totalTarget: 0, totalAchieved: 0 });
            }
            const current = metricsMap.get(target.metric_name);
            current.totalTarget += target.target_value || 0;
            current.totalAchieved += totalAchieved;
        });
        const result: any[] = [];
        metricsMap.forEach((data, metricName) => {
            result.push({
                title: metricName,
                target: data.totalTarget,
                achieved: data.totalAchieved,
                percentage: data.totalTarget > 0 ? (data.totalAchieved / data.totalTarget) * 100 : 0,
            });
        });
        return result;
    }, [targets, progressUpdates]);

    if (loading) return <div className="p-8 text-center">Loading Scorecard...</div>;
    
    const csrSpentPercentage = budgetData.totalBudget > 0 ? (budgetData.totalSpent / budgetData.totalBudget) * 100 : 0;

    return (
        <div className="p-6 md:p-8 space-y-8 bg-gray-50 min-h-full">
            <header>
                <h1 className="text-3xl font-bold text-gray-800">CSR Scorecard</h1>
                <p className="text-gray-600">Aggregated real-time progress of all project metrics.</p>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <ScorecardGauge isLarge={true} title="CSR Spent" percentage={csrSpentPercentage} achieved={budgetData.totalSpent} target={budgetData.totalBudget} />
                {aggregatedMetrics.map(metric => <ScorecardGauge key={metric.title} {...metric} />)}
            </div>

            {/* --- UPDATED: Per-Project Breakdown Section with Charts --- */}
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mt-4">Project Details</h2>
                {projects.map(project => {
                    const projectAllocation = allocations.find(a => a.project_id === project.id)?.total_budget || 0;
                    const projectSpent = expenditures.filter(e => e.project_id === project.id).reduce((sum, e) => sum + e.expenditure_amount, 0);
                    const budgetPercentage = projectAllocation > 0 ? (projectSpent / projectAllocation) * 100 : 0;
                    const projectTargets = targets.filter(t => t.project_id === project.id);

                    return (
                        <Card key={project.id}>
                            <h3 className="text-xl font-bold mb-4 text-emerald-700">{project.title}</h3>
                            {/* Replaced table with a grid of charts */}
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                <ScorecardGauge
                                    title="Budget"
                                    percentage={budgetPercentage}
                                    achieved={projectSpent}
                                    target={projectAllocation}
                                />
                                {projectTargets.map(target => {
                                    const achieved = progressUpdates.filter(p => p.metric_id === target.id).reduce((sum, p) => sum + p.achieved_value, 0);
                                    const percentage = target.target_value > 0 ? (achieved / target.target_value) * 100 : 0;
                                    return (
                                        <ScorecardGauge
                                            key={target.id}
                                            title={target.metric_name}
                                            percentage={percentage}
                                            achieved={achieved}
                                            target={target.target_value}
                                        />
                                    );
                                })}
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

export default ClientScorecard;