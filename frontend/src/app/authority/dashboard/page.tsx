"use client";

import { useState, useEffect } from "react";
import Map from "@/components/Map";
import Link from "next/link";

export default function DashboardPage() {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/reports");
        if (res.ok) {
          const data = await res.json();
          setReports(data);
          setFilteredReports(data);
        }
      } catch (error) {
        console.error("Failed to fetch reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  useEffect(() => {
    let filtered = reports;

    if (statusFilter !== "all") {
      filtered = filtered.filter(r => r.status?.toLowerCase() === statusFilter);
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(r => r.category?.toLowerCase() === categoryFilter.toLowerCase());
    }

    setFilteredReports(filtered);
  }, [reports, statusFilter, categoryFilter]);

  const categories = [...new Set(reports.map(r => r.category).filter(Boolean))];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">Authority Dashboard</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Map */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Report Locations</h2>
            <Map reports={filteredReports} />
          </div>
        </div>

        {/* Filters & Stats */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">Filters</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full border rounded-lg p-2"
                >
                  <option value="all">All Statuses</option>
                  <option value="reported">Reported</option>
                  <option value="assigned">Assigned</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full border rounded-lg p-2"
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">Statistics</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Total Reports:</span>
                <span className="font-semibold">{reports.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Filtered Results:</span>
                <span className="font-semibold">{filteredReports.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-600">Reported:</span>
                <span className="font-semibold">{reports.filter(r => r.status?.toLowerCase() === 'reported').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-yellow-600">Assigned:</span>
                <span className="font-semibold">{reports.filter(r => r.status?.toLowerCase() === 'assigned').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-600">Resolved:</span>
                <span className="font-semibold">{reports.filter(r => r.status?.toLowerCase() === 'resolved').length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="mt-8 bg-white rounded-lg border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Reports List</h2>
        </div>
        
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading reports...</p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredReports.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No reports match the current filters.
              </div>
            ) : (
              filteredReports.map((report) => (
                <div key={report.id || report._id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{report.category || "Uncategorized"}</h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            report.status?.toLowerCase() === "resolved"
                              ? "bg-green-100 text-green-800"
                              : report.status?.toLowerCase() === "assigned"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {report.status || "reported"}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{report.description}</p>
                      <div className="text-xs text-gray-500">
                        ID: {report.id || report._id} • {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : "Unknown date"}
                      </div>
                    </div>
                    <div className="ml-4 flex items-center gap-2">
                      {report.image && (
                        <img
                          src={report.image}
                          alt="Report"
                          className="w-16 h-16 object-cover rounded border"
                        />
                      )}
                      <Link
                        href={`/status/${report.id || report._id}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
