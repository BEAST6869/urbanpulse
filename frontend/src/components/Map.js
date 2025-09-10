'use client';

import { useEffect, useRef } from 'react';

export default function Map({ reports = [], center = [40.7128, -74.0060], zoom = 12 }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    // Dynamic import of Leaflet to avoid SSR issues
    const initMap = async () => {
      if (typeof window !== 'undefined') {
        const L = (await import('leaflet')).default;
        
        // Fix for default markers
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        if (mapRef.current && !mapInstance.current) {
          mapInstance.current = L.map(mapRef.current).setView(center, zoom);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(mapInstance.current);
        }
      }
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [center, zoom]);

  useEffect(() => {
    if (mapInstance.current && typeof window !== 'undefined') {
      const addMarkers = async () => {
        const L = (await import('leaflet')).default;
        
        // Clear existing markers
        mapInstance.current.eachLayer((layer) => {
          if (layer instanceof L.Marker) {
            mapInstance.current.removeLayer(layer);
          }
        });

        // Add new markers
        reports.forEach((report) => {
          if (report.location && report.location.coordinates) {
            const [lng, lat] = report.location.coordinates;
            
            // Create custom icon based on status
            const getMarkerColor = (status) => {
              switch (status?.toLowerCase()) {
                case 'reported': return '🔴';
                case 'assigned': return '🟡';
                case 'resolved': return '🟢';
                default: return '🔴';
              }
            };

            const marker = L.marker([lat, lng]).addTo(mapInstance.current);
            
            const popupContent = `
              <div class="p-2">
                <h3 class="font-semibold">${report.category || 'Report'}</h3>
                <p class="text-sm text-gray-600 mb-2">${report.description || 'No description'}</p>
                <p class="text-xs"><strong>Status:</strong> ${report.status || 'reported'}</p>
                <p class="text-xs"><strong>ID:</strong> ${report.id || report._id}</p>
                ${report.image ? `<img src="${report.image}" alt="Report image" class="w-full h-24 object-cover mt-2 rounded" />` : ''}
              </div>
            `;
            
            marker.bindPopup(popupContent);
          }
        });

        // Fit map to show all markers if there are any
        if (reports.length > 0) {
          const group = new L.featureGroup(
            reports
              .filter(r => r.location && r.location.coordinates)
              .map(r => L.marker([r.location.coordinates[1], r.location.coordinates[0]]))
          );
          if (group.getBounds().isValid()) {
            mapInstance.current.fitBounds(group.getBounds(), { padding: [20, 20] });
          }
        }
      };

      addMarkers();
    }
  }, [reports]);

  return (
    <div className="w-full h-96 border rounded-lg overflow-hidden">
      <div ref={mapRef} className="w-full h-full"></div>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
    </div>
  );
}
