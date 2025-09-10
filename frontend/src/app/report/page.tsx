"use client";

import { useState, useEffect } from "react";
import CameraUploader from "@/components/CameraUploader";
import { classifyImage } from "@/components/Classifier";

export default function ReportPage() {
  const [imageFile, setImageFile] = useState(null);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState(null);
  const [category, setCategory] = useState("");
  const [confidence, setConfidence] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successId, setSuccessId] = useState(null);

  useEffect(() => {
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
  }, []);

  const handleClassify = async () => {
    if (!imageFile) return;
    const result = await classifyImage(imageFile);
    setCategory(result.category);
    setConfidence(result.confidence);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      if (!imageFile) throw new Error("Please add a photo of the issue.");

      // Ensure we ran classification
      if (!category) {
        const result = await classifyImage(imageFile);
        setCategory(result.category);
        setConfidence(result.confidence);
      }

      const formData = new FormData();
      formData.append("description", description);
      formData.append("category", category);
      if (location) {
        formData.append("latitude", String(location.latitude));
        formData.append("longitude", String(location.longitude));
      }
      formData.append("image", imageFile);

      const res = await fetch("http://localhost:5000/api/reports", {
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

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleClassify}
            disabled={!imageFile}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg"
          >
            Classify Image
          </button>
          {category && (
            <span className="text-sm text-gray-700">
              Category: <strong>{category}</strong>{" "}
              {confidence && <em>({Math.round(confidence * 100)}% confidence)</em>}
            </span>
          )}
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

