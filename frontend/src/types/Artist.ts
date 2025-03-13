import { Song } from "./Song";

export interface Artist {
  ArtistId: number;
  Name: string;
  Spotifies: Song[];
}
