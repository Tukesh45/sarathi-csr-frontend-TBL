// src/pages/client/ClientProjects.tsx

import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useParams } from "react-router-dom";

// --- Types ---
interface Project {
  id: string;
  title: string;
  goal: string;
  geographic_scope: string;
  unit_of_measurement: string;
  target_beneficiaries: number | null;
  status: string;
  priority: "low" | "medium" | "high" | "critical";
  start_date: string | null;
  end_date: string | null;
  ngos?: { id: string; name: string };
}

const ClientProjects: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!clientId) return;
      setLoading(true);
      try {
        // 👇 Join ngo_id → ngos table to get ngo name
        const { data, error } = await supabase
          .from("projects")
          .select(
            `
            id, title, goal, geographic_scope,
            unit_of_measurement, target_beneficiaries,
            status, priority, start_date, end_date,
            ngos ( id, name )
          `
          )
          .eq("client_id", clientId);

        if (error) throw error;
        setProjects(data as unknown as Project[]);
      } catch (err: any) {
        setError(err.message || "Failed to fetch projects.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [clientId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-xl text-gray-500">Loading Projects...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <h3 className="text-xl font-bold text-red-600">
          Could Not Load Projects
        </h3>
        <p className="text-gray-600 mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <header>
          <h1 className="text-3xl font-bold text-gray-800">Projects</h1>
          <p className="text-gray-600">
            Projects linked to this client with NGO details.
          </p>
        </header>

        <div className="bg-white rounded-xl shadow-md p-6">
          {projects.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-left text-gray-600 text-sm">
                    <th className="py-3 px-4 font-semibold">Project Title</th>
                    <th className="py-3 px-4 font-semibold">NGO</th>
                    <th className="py-3 px-4 font-semibold">Goal</th>
                    <th className="py-3 px-4 font-semibold">Scope</th>
                    <th className="py-3 px-4 font-semibold">Beneficiaries</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold">Priority</th>
                    <th className="py-3 px-4 font-semibold">Start Date</th>
                    <th className="py-3 px-4 font-semibold">End Date</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr
                      key={project.id}
                      className="bg-gray-50 hover:bg-gray-100 rounded-lg"
                    >
                      <td className="py-3 px-4 font-medium text-gray-900">
                        {project.title}
                      </td>
                      <td className="py-3 px-4">
                        {project.ngos?.name ? (
                          <span className="px-3 py-1 text-sm rounded-full bg-indigo-100 text-indigo-700">
                            {project.ngos.name}
                          </span>
                        ) : (
                          <span className="text-gray-500">No NGO</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {project.goal}
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {project.geographic_scope}
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {project.target_beneficiaries || "—"}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 text-sm rounded-full ${
                            project.status === "active"
                              ? "bg-green-100 text-green-700"
                              : project.status === "completed"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {project.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 text-sm rounded-full ${
                            project.priority === "critical"
                              ? "bg-red-100 text-red-700"
                              : project.priority === "high"
                              ? "bg-orange-100 text-orange-700"
                              : project.priority === "medium"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {project.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {project.start_date || "—"}
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {project.end_date || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center p-12">
              <h3 className="text-lg font-medium text-gray-800">
                No Projects Found
              </h3>
              <p className="mt-1 text-gray-500">
                There are no projects assigned to this client yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientProjects;
