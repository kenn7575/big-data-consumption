import { Album } from "./Album";
import { Artist } from "./Artist";
import { Record } from "./Record";

export interface Song {
  SpotifyId: string;
  Name: string;
  IsExplicit: boolean;
  DurationMs: number;
  Danceability: number;
  Energy: number;
  Key: number;
  Loudness: number;
  Mode: number;
  Speechiness: number;
  Acousticness: number;
  Instrumentalness: number;
  Liveness: number;
  Valence: number;
  Tempo: number;
  TimeSignature: number;
  AlbumId: number;
  Album: Album | null;
  Records: Record[];
  Artists: Artist[];
}

export interface SongChart {
  [country: string]: number | string;

  SnapshotDate: string;
}
