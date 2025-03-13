import { Song } from "./Song";

export interface Record {
  RecordId: number;
  SpotifyId: string;
  DailyRank: number;
  DailyMovement: number;
  WeeklyMovement: number;
  Country: string;
  SnapshotDate: string;
  Popularity: number;
  Spotify: Song;
}
