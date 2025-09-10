"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import StatusTracker from "@/components/StatusTracker";

export default function StatusPage() {
  const params = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/reports/${params.id}`);
        if (!res.ok) {
          throw new Error("Report not found");
        }
        const data = await res.json();
        setReport(data);
      } catch (err) {
        setError(err.message || "Failed to fetch report");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchReport();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading report status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h1 className="text-2xl font-bold text-red-800 mb-2">Error</h1>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Report Status</h1>

      {report && (
        <div className="space-y-8">
          <div className="bg-white rounded-lg border p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Report Details</h2>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium">ID:</span> {report.id || report._id}
                  </div>
                  <div>
                    <span className="font-medium">Category:</span> {report.category || "Not classified"}
                  </div>
                  <div>
                    <span className="font-medium">Description:</span>
                    <p className="mt-1 text-gray-600">{report.description || "No description provided"}</p>
                  </div>
                  <div>
                    <span className="font-medium">Submitted:</span> {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : "Unknown"}
                  </div>
                  {report.location && report.location.coordinates && (
                    <div>
                      <span className="font-medium">Location:</span> {report.location.coordinates[1].toFixed(5)}, {report.location.coordinates[0].toFixed(5)}
                    </div>
                  )}
                </div>
              </div>
              
              {report.image && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Photo</h3>
                  <img
                    src={report.image}
                    alt="Report"
                    className="w-full h-64 object-cover rounded-lg border"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-6">Progress Status</h2>
            <StatusTracker status={report.status || "reported"} />
          </div>

          {report.notes && report.notes.length > 0 && (
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Updates</h2>
              <div className="space-y-4">
                {report.notes.map((note, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4">
                    <p className="text-gray-700">{note.message}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
