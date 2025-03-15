"use client";

import { redirect } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Combobox } from "@/components/Combobox";

import { client } from "@/axios";
import { SongSearch } from "@/types/Song";

import debounce from "debounce";

export default function SongsView() {
  const [search, setSearch] = useState("");
  const [songs, setSongs] = useState<SongSearch[]>([]);

  function handleSelect(value: string) {
    redirect(`/dashboard/songs/${value}`);
  }

  const debFetchRef = useRef<ReturnType<typeof debounce> | undefined>(
    undefined,
  );

  useEffect(() => {
    const fetchSongs = async (searchTerm: string) => {
      const { data } = await client.get<SongSearch[]>("Songs", {
        params: { search: searchTerm },
      });

      setSongs(data);
    };

    debFetchRef.current = debounce(fetchSongs, 2000);

    return () => {
      if (debFetchRef.current) debFetchRef.current.clear();
    };
  }, []);

  useEffect(() => {
    if (debFetchRef.current) debFetchRef.current(search);
  }, [search]);

  return (
    <Combobox
      values={songs.map((song) => ({
        value: song.SpotifyId,
        label: song.Name + " - " + song.Artists.join(", "),
      }))}
      onSearch={setSearch}
      onSelect={handleSelect}
    />
  );
}
