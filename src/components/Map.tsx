'use client';

declare global {
  interface Window {
    gmap?: google.maps.Map;
  }
}

import { useEffect, useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Circle } from '@react-google-maps/api';
import { TrashIcon } from '@heroicons/react/24/outline';
import type { FartLocation } from '@/types';

interface MapProps {
  onMapClick: (lat: number, lng: number) => void;
  onDelete: (id: number) => void;
  fartLocations: FartLocation[];
  newFart: FartLocation | null;
}

const pulsingDot = `
@keyframes pulsate {
  0% { transform: scale(0.8); opacity: 0.5; }
  50% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(0.8); opacity: 0.5; }
}
.pulsing-dot {
  width: 16px;
  height: 16px;
  background-color: #4f46e5;
  border-radius: 50%;
  position: relative;
  animation: pulsate 2s ease-in-out infinite;
  box-shadow: 0 0 0 6px rgba(79, 70, 229, 0.2);
}
`;

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '0.75rem'
};

interface MapCenter {
  lat: number;
  lng: number;
}

const defaultCenter: MapCenter = {
  lat: 37.7749, // San Francisco fallback
  lng: -122.4194
};

const options = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: true,
  clickableIcons: false,
  streetViewControl: true,
  maxZoom: 22, // Maximum zoom level
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'on' }]
    }
  ]
};

export default function Map({ onMapClick, onDelete, fartLocations, newFart }: MapProps) {
  const [center, setCenter] = useState<MapCenter>(defaultCenter);
  const [userLocation, setUserLocation] = useState<MapCenter & { accuracy?: number } | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  // Add map event listeners
  useEffect(() => {
    if (map) {
      map.addListener('dragstart', () => {
        setSelectedFart(null);
        setInfoPosition(null);
      });
    }
  }, [map]);

  const handleMyLocationClick = () => {
    if (userLocation && map) {
      map.panTo(userLocation);
      map.setZoom(18);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(newLocation);
          if (map) {
            map.panTo(newLocation);
            map.setZoom(18);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your location. Please check your browser settings.');
        }
      );
    }
  };
  useEffect(() => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by your browser');
      return;
    }

    // Get initial position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newCenter = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setCenter(newCenter);
        setUserLocation(newCenter);
      },
      (error) => {
        console.error('Error getting location:', error);
      }
    );

    // Watch position for real-time updates
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        setUserLocation(newLocation);
      },
      (error) => {
        console.error('Error watching location:', error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000, // Maximum cache age in milliseconds
        timeout: 5000 // Time to wait for a position
      }
    );

    // Cleanup: stop watching position when component unmounts
    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  const [selectedFart, setSelectedFart] = useState<(FartLocation & { isNew?: boolean }) | null>(null);
  const [infoPosition, setInfoPosition] = useState<{ x: number, y: number } | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  });

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    console.error('Google Maps API key is missing');
    return <div>Error: Google Maps API key is not configured</div>;
  }

  if (!isLoaded) {
    return <div>Loading map...</div>;
  }

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    onMapClick(e.latLng.lat(), e.latLng.lng());
  };

  const getFartIcon = (maps: typeof google.maps) => ({
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="40" height="40"><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="80">📍</text></svg>',
    scaledSize: new maps.Size(40, 40),
    anchor: new maps.Point(20, 20),
  });

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-xl">
        <div className="text-gray-600">Loading Map...</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <style>{pulsingDot}</style>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={18} // Start with a world view
        onClick={handleMapClick}
        options={options}
        onLoad={(map) => {
          setMap(map);
          window.gmap = map;
        }}
    >
      {fartLocations.map((fart) => (
        <Marker
          key={fart.id}
          position={{ lat: fart.latitude, lng: fart.longitude }}
          icon={getFartIcon(google.maps)}
          onClick={(e) => {
            if (!map || !e.domEvent) return;
            
            // Clear any existing overlay first
            setSelectedFart(null);
            setInfoPosition(null);
            
            const markerPosition = { lat: fart.latitude, lng: fart.longitude };
            
            // Pan to the marker
            map.panTo(markerPosition);
            
            // Wait for pan animation to complete
            google.maps.event.addListenerOnce(map, 'idle', () => {
              // Get screen coordinates of the marker
              const overlay = new google.maps.OverlayView();
              overlay.setMap(map);
              overlay.draw = () => {};
              
              const projection = overlay.getProjection();
              const point = projection?.fromLatLngToContainerPixel(
                new google.maps.LatLng(markerPosition)
              );
              
              if (point) {
                setInfoPosition({ x: point.x, y: point.y });
                setSelectedFart(fart);
              }
            });
          }}
        />
      ))}
      {newFart && (
        <Marker
          position={{ lat: newFart.latitude, lng: newFart.longitude }}
          icon={getFartIcon(google.maps)}
          onClick={(e) => {
            if (!map || !e.domEvent) return;
            
            // Clear any existing overlay first
            setSelectedFart(null);
            setInfoPosition(null);
            
            const markerPosition = { lat: newFart.latitude, lng: newFart.longitude };
            
            // Pan to the marker
            map.panTo(markerPosition);
            
            // Wait for pan animation to complete
            google.maps.event.addListenerOnce(map, 'idle', () => {
              // Get screen coordinates of the marker
              const overlay = new google.maps.OverlayView();
              overlay.setMap(map);
              overlay.draw = () => {};
              
              const projection = overlay.getProjection();
              const point = projection?.fromLatLngToContainerPixel(
                new google.maps.LatLng(markerPosition)
              );
              
              if (point) {
                setInfoPosition({ x: point.x, y: point.y });
                setSelectedFart({ ...newFart, isNew: true });
              }
            });
          }}
        />
      )}
      {selectedFart && infoPosition && (
        <div 
          className="absolute z-50"
          style={{
            left: `${infoPosition.x}px`,
            top: `${infoPosition.y}px`,
            transform: 'translate(-50%, -120%)',
          }}
        >
          <div className="bg-white rounded-lg shadow-xl p-4 relative min-w-[300px]">
            {/* Triangle pointer */}
            <div 
              className="absolute left-1/2 -bottom-2 w-4 h-4 bg-white transform -translate-x-1/2 rotate-45"
              style={{ boxShadow: '4px 4px 8px rgba(0, 0, 0, 0.1)' }}
            />
            
            <div className="flex justify-between items-start gap-4 mb-3">
              <div className="flex-grow">
                {selectedFart.description && (
                  <p className="text-lg font-medium text-gray-900 break-words leading-snug">
                    {selectedFart.description}
                  </p>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (typeof selectedFart.id === 'number') {
                    onDelete(selectedFart.id);
                    setSelectedFart(null);
                    setInfoPosition(null);
                  }
                }}
                className="text-red-500 hover:text-red-700 transition-colors p-1 hover:bg-red-50 rounded"
                title="Delete fart"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-800">
                By: {selectedFart.name || 'Anonymous'}
              </p>
              <p className="text-sm text-gray-600">
                {new Date(selectedFart.timestamp).toLocaleString()}
              </p>
            </div>

            <button
              onClick={() => {
                setSelectedFart(null);
                setInfoPosition(null);
              }}
              className="absolute -top-2 -right-2 bg-gray-800 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm hover:bg-gray-700 transition-colors"
            >
              ×
            </button>
          </div>
        </div>
      )}
      {userLocation && (
        <>
          <Circle
            center={userLocation}
            radius={userLocation.accuracy || 0}
            options={{
              fillColor: '#4f46e5',
              fillOpacity: 0.1,
              strokeColor: '#4f46e5',
              strokeOpacity: 0.3,
              strokeWeight: 1,
            }}
          />
          <Marker
            position={userLocation}
            icon={{
              url: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32'><circle cx='16' cy='16' r='8' fill='%234f46e5' stroke='white' stroke-width='2'/></svg>`,
              scaledSize: new google.maps.Size(32, 32),
              anchor: new google.maps.Point(16, 16)
            }}
            title="You are here"
          />
        </>
      )}
      </GoogleMap>
      <button
        onClick={handleMyLocationClick}
        className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200 ease-in-out"
        title="Go to my location"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-purple-600 dark:text-purple-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>
    </div>
  );
}
