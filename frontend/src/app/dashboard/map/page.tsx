"use client";

import React, { useCallback, useEffect, useState } from "react";

import WorldMap from "@/components/charts/WorldMap";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { client } from "@/axios";
import { cn } from "@/lib/utils";

import debounce from "debounce";
import { Check, ChevronsUpDown, Loader2, Search } from "lucide-react";

import MockData from "./mock_artist_data.json";

interface ArtistData {
  artistId: number;
  name: string;
}

export default function App() {
  const [selectedArtist, setSelectedArtist] = useState<ArtistData | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ArtistData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  // Change to string type for easier handling with the date input
  const [selectedDate, setSelectedDate] = useState("2023-11-01");
  const [worldData, setWorldData] = useState<any[]>([]);

  // Fetch artists based on search term
  const fetchArtists = async (searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      // Replace with your actual artist search endpoint
      let url = "Artists/SearchArtistsByName"; // This should be your actual artist search endpoint

      const params = new URLSearchParams();
      params.append("name", searchTerm);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      // For debugging: console log the full URL
      console.log("Fetching from:", url);

      try {
        const response = await client.get<ArtistData[]>(url);
        console.log("Search results:", response.data);
        setResults(response.data);
      } catch (error) {
        console.error("API error:", error);

        // TEMPORARY: Use mock data while API is not available
        console.log("Using mock data instead");

        // Filter mock data based on search term (simulating search)
        const mockResults = Object.entries(MockData)
          .map(([name, data], index) => ({
            artistId: index,
            name,
          }))
          .filter((artist) =>
            artist.name.toLowerCase().includes(searchTerm.toLowerCase()),
          );

        console.log("Mock results generated:", mockResults);
        setResults(mockResults);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWorldData = async (artistId: number) => {
    // Replace with your actual artist data endpoint
    let url = `Records/GetArtistPopularityByDate/${artistId}/${selectedDate}`; // Using the string date directly

    // For debugging: console log the full URL
    console.log("Fetching from:", url);

    try {
      const response = await client.get(url);
      console.log("Artist data:", response.data);
      setWorldData(response.data);
    } catch (error) {
      console.error("API error:", error);
    }
  };

  // Watch for changes in selectedDate or selectedArtist and fetch data when either changes
  useEffect(() => {
    if (selectedArtist) {
      console.log(
        `Fetching data for artist ${selectedArtist.name} on date ${selectedDate}`,
      );
      fetchWorldData(selectedArtist.artistId);
    }
  }, [selectedDate, selectedArtist]);

  // Debounce the API calls to prevent too many requests
  const debouncedFetch = useCallback(
    debounce((searchTerm) => fetchArtists(searchTerm), 300),
    [],
  );

  // Handle input change and trigger search
  const handleSearchChange = (value: string) => {
    setQuery(value);
    debouncedFetch(value);
  };

  // Select an artist and get their data
  const handleSelectArtist = (artist: ArtistData) => {
    setSelectedArtist(artist);
    setOpen(false);
    // We don't need to call fetchWorldData here anymore since the useEffect will handle it
  };

  // Force the popup to stay open when results are available
  useEffect(() => {
    if (results.length > 0 && query.length >= 2) {
      setOpen(true);
    }
  }, [results, query]);

  return (
    <div className="min-h-screen p-6">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-muted rounded-lg p-6 shadow-lg">
          <h1 className="text-foreground mb-6 text-3xl font-bold">
            Artist Popularity World Map
          </h1>

          <div className="mb-6 flex flex-wrap items-end gap-4">
            <div className="min-w-[240px]">
              <label className="mb-1 block text-sm font-medium">Artist</label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                  >
                    {selectedArtist
                      ? selectedArtist.name
                      : "Search for an artist..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px]" align="start">
                  <Command>
                    <CommandInput
                      placeholder="Search artists..."
                      value={query}
                      onValueChange={handleSearchChange}
                    />
                    <CommandList className="max-h-[300px]">
                      {isLoading && (
                        <div className="flex items-center justify-center py-6">
                          <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                      )}
                      {!isLoading && results.length === 0 && (
                        <CommandEmpty>
                          {query.length > 0
                            ? "No artists found"
                            : "Type to search..."}
                        </CommandEmpty>
                      )}
                      {!isLoading && results.length > 0 && (
                        <CommandGroup heading="Artists">
                          {results.map((artist) => (
                            <CommandItem
                              key={artist.artistId}
                              value={artist.name}
                              onSelect={() => handleSelectArtist(artist)}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedArtist?.artistId === artist.artistId
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {artist.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Date</label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-40"
              />
            </div>
          </div>

          <div className="bg-card aspect-video overflow-hidden rounded-lg">
            {worldData.length > 0 && <WorldMap artistData={worldData} />}
          </div>

          <div className="mt-4 text-sm text-gray-600">
            <p>
              The heatmap shows relative popularity scores (0-100) across
              different countries.
            </p>
            <p>Hover over countries to see detailed popularity scores.</p>
            {!selectedArtist && (
              <p className="mt-2 text-amber-600">
                Search and select an artist to see their global popularity data.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
