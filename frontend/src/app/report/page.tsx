"use client";

import { useState, useEffect } from "react";
import CameraUploader from "@/components/CameraUploader";
import { classifyImage, getModelInfo, isClassificationAvailable } from "@/components/Classifier";

export default function ReportPage() {
  const [imageFile, setImageFile] = useState(null);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState(null);
  const [category, setCategory] = useState("");
  const [confidence, setConfidence] = useState(null);
  const [classificationResult, setClassificationResult] = useState(null);
  const [aiAvailable, setAiAvailable] = useState(false);
  const [modelInfo, setModelInfo] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successId, setSuccessId] = useState(null);

  useEffect(() => {
    // Get geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setLocation({ latitude, longitude });
        },
        (err) => {
          console.warn("Geolocation error:", err);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
    
    // Check AI availability
    const checkAI = async () => {
      const available = await isClassificationAvailable();
      setAiAvailable(available);
      
      if (available) {
        const info = await getModelInfo();
        setModelInfo(info);
      }
    };
    
    checkAI();
  }, []);

  const handleClassify = async () => {
    if (!imageFile) return;
    
    setError("");
    
    try {
      const result = await classifyImage(imageFile);
      setClassificationResult(result);
      setCategory(result.backendCategory || result.category);
      setConfidence(result.confidence);
      
      if (result.error) {
        setError(`Classification warning: ${result.error}`);
      }
    } catch (error) {
      setError(`Classification failed: ${error.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      if (!imageFile) throw new Error("Please add a photo of the issue.");

      // Ensure we ran classification
      if (!category && aiAvailable) {
        const result = await classifyImage(imageFile);
        setClassificationResult(result);
        setCategory(result.backendCategory || result.category);
        setConfidence(result.confidence);
      }

      const formData = new FormData();
      formData.append("title", `Urban Issue Report - ${category || 'Other'}`);
      formData.append("description", description);
      formData.append("category", category || 'other');
      formData.append("priority", 'medium');
      
      if (location) {
        formData.append("location", JSON.stringify({
          type: 'Point',
          coordinates: [location.longitude, location.latitude]
        }));
        formData.append("address", `Location: ${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`);
      }
      
      formData.append("reporter", JSON.stringify({
        name: 'Anonymous User',
        email: 'user@urbanpulse.app',
        phone: ''
      }));
      
      formData.append("images", imageFile);

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const res = await fetch(`${API_URL}/api/reports`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to submit report");
      }

      const data = await res.json();
      setSuccessId(data.id || data._id);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Report an Issue</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Photo</label>
          <CameraUploader onImageUpload={setImageFile} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            placeholder="Describe the issue..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleClassify}
              disabled={!imageFile || !aiAvailable}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg"
            >
              {aiAvailable ? 'Classify Image' : 'AI Unavailable'}
            </button>
            
            {!aiAvailable && (
              <span className="text-sm text-amber-600">
                ⚠️ AI classification is currently unavailable
              </span>
            )}
          </div>
          
          {classificationResult && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">AI Classification:</span>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                  {classificationResult.category}
                </span>
                <span className="text-sm text-gray-600">
                  ({Math.round(classificationResult.confidence * 100)}% confidence)
                </span>
              </div>
              
              {classificationResult.backendCategory !== classificationResult.category && (
                <div className="text-sm text-gray-600">
                  Mapped to: <strong>{classificationResult.backendCategory}</strong>
                </div>
              )}
              
              {classificationResult.confidence < (classificationResult.threshold || 0.7) && (
                <div className="text-sm text-amber-600">
                  ⚠️ Low confidence - please verify the category
                </div>
              )}
              
              {classificationResult.allPredictions && classificationResult.allPredictions.length > 1 && (
                <div className="text-xs text-gray-500">
                  <details>
                    <summary className="cursor-pointer hover:text-gray-700">View all predictions</summary>
                    <div className="mt-2 space-y-1">
                      {classificationResult.allPredictions.slice(0, 3).map((pred, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>{pred.category}</span>
                          <span>{Math.round(pred.confidence * 100)}%</span>
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Category (Manual Override)</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select category...</option>
            <option value="infrastructure">Infrastructure</option>
            <option value="environment">Environment</option>
            <option value="safety">Safety</option>
            <option value="transportation">Transportation</option>
            <option value="public_services">Public Services</option>
            <option value="other">Other</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Leave blank to use AI classification, or select manually to override
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Location</label>
          {location ? (
            <p className="text-sm text-gray-600">
              Lat: {location.latitude.toFixed(5)}, Lng: {location.longitude.toFixed(5)}
            </p>
          ) : (
            <p className="text-sm text-gray-500">Fetching your location...</p>
          )}
        </div>

        {error && <p className="text-red-600">{error}</p>}
        {successId && (
          <p className="text-green-600">
            Report submitted! View status at <a href={`/status/${successId}`} className="underline text-blue-600">/status/{successId}</a>
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
        >
          {submitting ? "Submitting..." : "Submit Report"}
        </button>
      </form>
    </div>
  );
}

