import { server } from "@/axios";
import { Record } from "@/types/Record";
import { Song, SongChart } from "@/types/Song";

import SongView from "./SongView";

interface SongPageProps {
  params: Promise<{ songId: string }>;
}

export interface SongExtended extends Song {
  Records: Record[];
  topRank: number;
  songChart: SongChart[];
}

type Country = string[];

export default async function SongPage({ params }: SongPageProps) {
  const { songId } = await params;

  const { data: countries } = await server.get<Country>(
    `Songs/GetPossibleCountries/${songId}`,
  );

  if (countries.length === 0) return <div>Not found</div>;

  const { data: song } = await server.get<Song>(`Songs/${songId}`, {
    params: { Countries: countries[0] || "Global" },
    paramsSerializer: { indexes: null },
  });

  const { data: songChart } = await server.get<SongChart[]>(
    `Songs/GetSongChartData/${songId}`,
    {
      params: { Countries: countries[0] || "Global" },
      paramsSerializer: { indexes: null },
    },
  );

  if (!song || !song.Records) return <div>Not found</div>;

  const values = [...song.Records];

  if (!songChart || songChart.length === 0 || values.length === 0)
    return <div>Not found</div>;

  const extendedSong = {
    ...song,
    topRank: values.sort((a, b) => a.DailyRank - b.DailyRank)[0].DailyRank,
    songChart,
  } satisfies SongExtended;

  return <SongView initSong={extendedSong} possibleCountries={countries} />;
}
