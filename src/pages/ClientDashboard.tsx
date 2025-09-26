// src/pages/ClientDashboard.tsx

import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useParams, useNavigate } from "react-router-dom";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid
} from "recharts";

//==============================================================================
// TYPE DEFINITIONS
//==============================================================================
interface Client {
  id: string;
  company_name: string;
  annual_csr_budget: number;
}
interface Project {
  id: string;
  title: string;
  status: 'draft' | 'active' | 'completed' | 'on-hold';
  target_beneficiaries: number;
  geographic_scope: string;
  start_date?: string;
  end_date?: string;
  ngo_id: string;
}
interface NGO {
  id: string;
  name: string;
}
interface Budget {
  project_id: string;
  total_budget: number;
}
interface Expenditure {
  project_id: string;
  expenditure_amount: number;
}

//==============================================================================
// REUSABLE UI COMPONENTS
//==============================================================================

// Simple Pie Chart component for status breakdown (from AdminDashboard)
const PieChart = ({ data }: { data: { label: string; value: number; color: string }[] }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) return null; // Don't render anything if there's no data

  let cumulative = 0;
  return (
    <svg width={160} height={160} viewBox="0 0 160 160">
      {data.map((d, i) => {
        if (d.value === 0) return null;
        const startAngle = (cumulative / total) * 2 * Math.PI;
        const endAngle = ((cumulative + d.value) / total) * 2 * Math.PI;
        const x1 = 80 + 70 * Math.cos(startAngle - Math.PI / 2);
        const y1 = 80 + 70 * Math.sin(startAngle - Math.PI / 2);
        const x2 = 80 + 70 * Math.cos(endAngle - Math.PI / 2);
        const y2 = 80 + 70 * Math.sin(endAngle - Math.PI / 2);
        const largeArc = d.value / total > 0.5 ? 1 : 0;
        const pathData = `M80,80 L${x1},${y1} A70,70 0 ${largeArc} 1 ${x2},${y2} Z`;
        cumulative += d.value;
        return <path key={i} d={pathData} fill={d.color} stroke="#fff" strokeWidth={2} />;
      })}
    </svg>
  );
};

const ScoreCard = ({ label, value, target, unit = "" }: { label: string; value: number; target: number; unit?: string; }) => {
  const safeTarget = target > 0 ? target : 1;
  const percentage = Math.min(Math.round((value / safeTarget) * 100), 100);
  const circumference = 2 * Math.PI * 30; // Radius 30
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColorClass = () => {
    if (percentage >= 75) return "text-green-500";
    if (percentage >= 40) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center text-center transition-all duration-300 hover:shadow-md">
      <div className="relative w-24 h-24 mb-3">
        <svg className="w-full h-full" viewBox="0 0 70 70">
          <circle className="text-gray-200" strokeWidth="7" stroke="currentColor" fill="transparent" r="30" cx="35" cy="35" />
          <circle
            className={getColorClass()}
            strokeWidth="7"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r="30"
            cx="35"
            cy="35"
            transform="rotate(-90 35 35)"
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
          <text x="50%" y="50%" className="text-xl font-bold text-gray-700" textAnchor="middle" dy=".3em">{`${percentage}%`}</text>
        </svg>
      </div>
      <div className="text-2xl font-bold text-gray-800">{unit}{value.toLocaleString('en-IN')}</div>
      <div className="text-xs text-gray-500">of {target.toLocaleString('en-IN')}</div>
      <div className="text-sm font-medium text-gray-600 mt-2">{label}</div>
    </div>
  );
};

const ChartCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-white rounded-lg shadow p-6 flex flex-col h-full">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
        <div className="flex-grow">{children}</div>
    </div>
);

//==============================================================================
// MAIN DASHBOARD COMPONENT
//==============================================================================
const ClientDashboard: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();

  // --- STATE MANAGEMENT ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Data states
  const [client, setClient] = useState<Client | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [ngos, setNgos] = useState<NGO[]>([]);
  
  // Calculated metric states
  const [totalAllocated, setTotalAllocated] = useState(0);
  const [livesImpacted, setLivesImpacted] = useState(0);
  const [locationsCovered, setLocationsCovered] = useState(0);
  const [statusData, setStatusData] = useState<{label: string, value: number, color: string}[]>([]);
  const [budgetChartData, setBudgetChartData] = useState<{name: string, Budget: number, Spent: number}[]>([]);
  
  // --- DATA FETCHING & PROCESSING ---
  useEffect(() => {
    if (!clientId) {
        setError("No Client ID found in URL.");
        setLoading(false);
        return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. Fetch the main client record first.
        const { data: clientData, error: clientError } = await supabase
            .from("clients")
            .select("id, company_name, annual_csr_budget")
            .eq("id", clientId)
            .single();

        if (clientError || !clientData) {
          throw new Error(clientError?.message || "Could not find the client record.");
        }
        setClient(clientData);

        // 2. Fetch all projects associated with this client.
        const { data: projectData, error: projectError } = await supabase
            .from("projects")
            .select("id, title, status, target_beneficiaries, geographic_scope, start_date, end_date, ngo_id")
            .eq("client_id", clientId);
        if (projectError) throw projectError;
        const safeProjects: Project[] = projectData || [];
        setProjects(safeProjects);

        // If there are no projects, we can stop here.
        if (safeProjects.length === 0) {
            setLoading(false);
            return;
        }

        // 3. Fetch all necessary related data for the projects.
        const ngoIds = Array.from(new Set(safeProjects.map(p => p.ngo_id).filter(Boolean)));
        const projectIds = safeProjects.map(p => p.id);

        const [ngosRes, budgetsRes, expendituresRes] = await Promise.all([
          ngoIds.length > 0 ? supabase.from("ngos").select("id, name").in("id", ngoIds) : Promise.resolve({ data: [], error: null }),
          supabase.from("budget_allocations").select("project_id, total_budget").in("project_id", projectIds),
          supabase.from("project_expenditures").select("project_id, expenditure_amount").in("project_id", projectIds),
        ]);
        
        if (ngosRes.error || budgetsRes.error || expendituresRes.error) {
            throw new Error("Failed to fetch related project data.");
        }
        
        setNgos(ngosRes.data || []);
        const budgets: Budget[] = budgetsRes.data || [];
        const expenditures: Expenditure[] = expendituresRes.data || [];

        // 4. Process all the fetched data to calculate metrics for the dashboard.
        setTotalAllocated(budgets.reduce((sum, b) => sum + b.total_budget, 0));
        setLivesImpacted(safeProjects.reduce((sum, p) => sum + (p.target_beneficiaries || 0), 0));

        const allLocations = safeProjects.flatMap(p => p.geographic_scope ? p.geographic_scope.split(',').map(s => s.trim()) : []);
        setLocationsCovered(new Set(allLocations).size);

        const statusCounts = safeProjects.reduce((acc, p) => {
            acc[p.status] = (acc[p.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        setStatusData([
            { label: 'Completed', value: statusCounts['completed'] || 0, color: '#22c55e' },
            { label: 'Active', value: statusCounts['active'] || 0, color: '#3b82f6' },
            { label: 'On Hold', value: statusCounts['on-hold'] || 0, color: '#f59e0b' },
            { label: 'Draft', value: statusCounts['draft'] || 0, color: '#64748b' },
        ]);

        const projectBudgetSpent = safeProjects.map(p => {
            const budget = budgets.find(b => b.project_id === p.id)?.total_budget || 0;
            const spent = expenditures.filter(e => e.project_id === p.id).reduce((sum, e) => sum + e.expenditure_amount, 0);
            return { name: p.title, Budget: budget, Spent: spent };
        });
        setBudgetChartData(projectBudgetSpent);

      } catch (err: any) {
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [clientId]);

  // --- CONDITIONAL RENDERING ---
  if (loading) {
    return <div className="p-8 text-center text-gray-600">Loading dashboard...</div>;
  }
  
  if (error || !client) {
    return (
        <div className="p-8 text-center">
            <h3 className="text-xl font-bold text-red-600">Dashboard Could Not Be Loaded</h3>
            <p className="text-gray-600 mt-2">{error}</p>
            <button 
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => navigate('/login')}
            >
                Go to Login
            </button>
        </div>
    );
  }
  
  // Calculate total for pie chart to handle empty state
  const totalStatus = statusData.reduce((sum, item) => sum + item.value, 0);
  
  // --- MAIN RENDER ---
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">{client.company_name} Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Welcome back. Here is an overview of your CSR initiatives.
        </p>
      </header>
      
      <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-4 mb-8">
        <h4 className="font-bold">Dashboard Metrics Explained:</h4>
        <ul className="list-disc list-inside text-sm mt-2">
            <li><strong>Lives Impacted:</strong> Total number of beneficiaries targeted across all your projects.</li>
            <li><strong>Locations Covered:</strong> Unique geographic areas where your projects are implemented.</li>
            <li><strong>Total Allocated:</strong> Sum of all budgets allocated to your projects.</li>
        </ul>
      </div>

      <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6 mb-8">
        <ScoreCard label="Your Projects" value={projects.length} target={Math.max(projects.length, 1)} />
        <ScoreCard label="Total Allocated" value={totalAllocated} target={client.annual_csr_budget || 1} unit="₹" />
        <ScoreCard label="Lives Impacted" value={livesImpacted} target={Math.max(livesImpacted, 1)} />
        <ScoreCard label="Locations Covered" value={locationsCovered} target={Math.max(locationsCovered, 1)} />
      </section>

      <section className="flex flex-col lg:flex-row gap-8 mb-8">
        <div className="lg:w-1/3">
            <ChartCard title="Project Status Breakdown">
                <div className="flex flex-col justify-center items-center h-full min-h-[350px]">
                    {totalStatus > 0 ? (
                        <>
                            <PieChart data={statusData} />
                            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
                                {statusData.map((d, i) => (
                                    d.value > 0 &&
                                    <div key={i} className="flex items-center gap-2 text-sm">
                                        <span style={{ width: 14, height: 14, backgroundColor: d.color, borderRadius: '4px' }}></span>
                                        <span>{d.label}: {d.value}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="text-center text-gray-500">No project status data.</div>
                    )}
                </div>
            </ChartCard>
        </div>
        <div className="lg:w-2/3">
            <ChartCard title="Project-wise Budget vs. Spent">
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={budgetChartData} margin={{ top: 5, right: 20, left: 20, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-35} textAnchor="end" />
                        <YAxis tickFormatter={(val) => `₹${(val/100000).toLocaleString()}L`} />
                        <Tooltip formatter={(val:number) => `₹${val.toLocaleString('en-IN')}`} />
                        <Legend />
                        <Bar dataKey="Budget" fill="#a5b4fc" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Spent" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </ChartCard>
        </div>
      </section>

      <section>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Projects</h3>
          <div className="bg-white rounded-lg shadow overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                      <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project Title</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Partner NGO</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timeline</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Beneficiaries</th>
                      </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                      {projects.length > 0 ? projects.map(p => (
                          <tr key={p.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.title}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{ngos.find(n => n.id === p.ngo_id)?.name || 'N/A'}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{p.status}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {p.start_date ? new Date(p.start_date).toLocaleDateString() : 'N/A'} - {p.end_date ? new Date(p.end_date).toLocaleDateString() : 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.target_beneficiaries?.toLocaleString('en-IN')}</td>
                          </tr>
                      )) : (
                          <tr>
                              <td colSpan={5} className="text-center py-10 text-gray-500">No projects found.</td>
                          </tr>
                      )}
                  </tbody>
              </table>
          </div>
      </section>
    </div>
  );
};

export default ClientDashboard;