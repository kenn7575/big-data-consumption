"use client";

import React, { useState } from "react";

import WorldMap from "@/components/charts/WorldMap";

import { Search } from "lucide-react";

import MockData from "./mock_artist_data.json";

// Mock data - in a real application, this would come from an API
const mockArtistData = {
  "Taylor Swift": [
    { country: "US", popularity: 95 },
    { country: "GB", popularity: 92 },
    { country: "CA", popularity: 90 },
    { country: "AU", popularity: 88 },
    { country: "JP", popularity: 85 },
    { country: "DE", popularity: 82 },
    { country: "FR", popularity: 80 },
    { country: "BR", popularity: 78 },
    { country: "MX", popularity: 75 },
    { country: "IN", popularity: 70 },
    { country: "DK", popularity: 50 },
  ],
  BTS: [
    { country: "KR", popularity: 98 },
    { country: "GL", popularity: 95 },
    { country: "PH", popularity: 92 },
    { country: "ID", popularity: 90 },
    { country: "US", popularity: 85 },
    { country: "TH", popularity: 88 },
    { country: "MY", popularity: 87 },
    { country: "BR", popularity: 20 },
    { country: "MX", popularity: 80 },
    { country: "GB", popularity: 78 },
  ],
};

function App() {
  const [selectedArtist, setSelectedArtist] = useState("Taylor Swift");
  const [searchTerm, setSearchTerm] = useState("");

  const artists = Object.keys(mockArtistData);
  const filteredArtists = artists.filter((artist) =>
    artist.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-muted rounded-lg p-6 shadow-lg">
          <h1 className="text-foreground mb-6 text-3xl font-bold">
            Artist Popularity World Map
          </h1>

          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search artists..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <Search
                className="absolute top-2.5 right-3 text-gray-400"
                size={20}
              />
            </div>

            <div className="mt-2 space-x-2">
              {filteredArtists.map((artist) => (
                <button
                  key={artist}
                  onClick={() => setSelectedArtist(artist)}
                  className={`mt-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    selectedArtist === artist
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {artist}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-card aspect-video overflow-hidden rounded-lg">
            <WorldMap
              artistData={
                MockData[selectedArtist as keyof typeof mockArtistData]
              }
            />
          </div>

          <div className="mt-4 text-sm text-gray-600">
            <p>
              The heatmap shows relative popularity scores (0-100) across
              different countries.
            </p>
            <p>Hover over countries to see detailed popularity scores.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
