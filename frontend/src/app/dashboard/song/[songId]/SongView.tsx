"use client";

import { useEffect, useState } from "react";

import { Combobox } from "@/components/Combobox";
import { LineChart } from "@/components/LineChart";

import { client } from "@/axios";
import { Song, SongChart } from "@/types/Song";
import allCountries from "@/util/countries.json";

import { SongExtended } from "./page";

interface SongViewProps {
  initSong: SongExtended;
  possibleCountries: string[];
}

export default function SongView({
  initSong,
  possibleCountries,
}: SongViewProps) {
  const [song, setSong] = useState(initSong);
  const [countries, setCountries] = useState<string[]>([
    possibleCountries[0] || "Global",
  ]);

  async function getData() {
    const { data: song } = await client.get<Song>(
      `Songs/${initSong.SpotifyId}`,
      {
        params: { Countries: countries },
        paramsSerializer: { indexes: null },
      },
    );

    const { data: songChart } = await client.get<SongChart[]>(
      `Songs/GetSongChartData/${initSong.SpotifyId}`,
      {
        params: { Countries: countries },
        paramsSerializer: { indexes: null },
      },
    );

    if (!song || !song.Records) return;

    const values = [...song.Records];

    if (values.length === 0) return;

    const extendedSong = {
      ...song,
      topRank: values.sort((a, b) => a.DailyRank - b.DailyRank)[0].DailyRank,
      songChart,
    } satisfies SongExtended;

    setSong(extendedSong);
  }

  useEffect(() => {
    getData();
  }, [countries]);

  const Artists = song.Artists?.map((a) => a.Name).join(", ");

  const normilizedCountries = possibleCountries.map((value) => {
    value ??= "Global";

    let label = allCountries.find((c) => c.code === value)?.name || "Global";
    label += ` [${value}]`;

    return { label, value };
  });

  return (
    <LineChart
      title={song.Name + " - " + Artists}
      description={song.Album?.AlbumName}
      titleLeft={["Top Rank", song.topRank]}
      headerRight={
        <Combobox
          values={normilizedCountries}
          selected={countries}
          setSelected={setCountries}
          disabled={countries.length >= 5}
          multiselect
        />
      }
      data={song.songChart}
      XKey="SnapshotDate"
      YKey="DailyRank"
    />
  );
}
