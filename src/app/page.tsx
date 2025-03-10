"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabase';
import { FartLocation } from '@/types';
import FartForm from '@/components/FartForm';

const Map = dynamic(() => import('@/components/Map'), { ssr: false });

export default function Home() {
  const [fartLocations, setFartLocations] = useState<FartLocation[]>([]);
  const [newFart] = useState<FartLocation | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    fetchFartLocations();
  }, []);

  async function fetchFartLocations() {
    try {
      const { data, error } = await supabase
        .from('fart_locations')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) throw error;
      if (data) setFartLocations(data);
      console.log(data);
    } catch (error) {
      console.error('Error fetching fart locations:', error);
      alert('Failed to load fart locations. Please try refreshing the page.');
    }
  }

  function generateRandomName() {
    const adjectives = ['Silent', 'Loud', 'Squeaky', 'Thunderous', 'Stealthy', 'Deadly', 'Toxic', 'Bubbly', 'Explosive', 'Nervous'];
    const nouns = ['Toots', 'Ripper', 'Blaster', 'Whistler', 'Rumbler', 'Squeaker', 'Bomber', 'Pooter', 'Trumpet', 'Breeze'];
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${randomAdjective} ${randomNoun}`;
  }

  function handleMapClick(lat: number, lng: number) {
    setSelectedLocation({ lat, lng });
    setShowForm(true);
  }

  async function handleFormSubmit(description: string, name: string) {
    if (!selectedLocation) return;
    
    try {
      const { error } = await supabase
        .from('fart_locations')
        .insert({
          latitude: selectedLocation.lat,
          longitude: selectedLocation.lng,
          description,
          timestamp: new Date().toISOString(),
          name: name || generateRandomName()
        });

      if (error) throw error;
      
      await fetchFartLocations();
      setShowForm(false);
      setSelectedLocation(null);
    } catch (error) {
      console.error('Error saving location:', error);
      alert('Failed to save location. Please try again.');
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this fart?')) return;
    
    try {
      const { error } = await supabase
        .from('fart_locations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchFartLocations();
    } catch (error) {
      console.error('Error deleting location:', error);
      alert('Failed to delete location. Please try again.');
    }
  }




  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-blue-500 bg-clip-text mb-4">
            🌎 Global Fart Tracker
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Track and discover fart friends around the world! 💨
          </p>
        </div>
        
        <div className="rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-gray-800 p-2">
          <div className="h-[75vh] w-full relative">
            <Map 
              onMapClick={handleMapClick}
              onDelete={handleDelete}
              fartLocations={fartLocations}
              newFart={newFart}
            />
            {showForm && (
              <FartForm
                defaultName={generateRandomName()}
                onSubmit={handleFormSubmit}
                onClose={() => {
                  setShowForm(false);
                  setSelectedLocation(null);
                }}
              />
            )}
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            👆 Click anywhere on the map to log a new fart location!
          </p>
        </div>
      </div>
    </div>
  );
}
