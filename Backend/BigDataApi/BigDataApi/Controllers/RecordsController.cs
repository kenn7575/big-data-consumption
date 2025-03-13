using System.Globalization;
using BigDataApi.Data;
using BigDataApi.Dtos;
using BigDataApi.Interfaces;
using BigDataApi.Managers;
using BigDataApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BigDataApi.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class RecordsController : ControllerBase
    {
        private readonly AppDBContext appDBContext;
        private readonly IRecordManager recordsManager;

        public RecordsController(AppDBContext appDBContext, IRecordManager recordsManager)
        {
            this.appDBContext = appDBContext;
            this.recordsManager = recordsManager;
        }


        [HttpGet("TestSetupData")]
        public async Task<IActionResult> Get()
        {
            List<Album> albums = new List<Album>();
            List<Artist> artistss = new List<Artist>();
            List<Song> songss = new List<Song>();

            var list = System.IO.File.ReadAllLines("C:\\Users\\HFGF\\.cache\\kagglehub\\datasets\\anandshaw2001\\top-spotify-songs-in-73-countries\\versions\\1\\Top_spotify_songs.csv").ToList();
            bool firstLine = true;

            int counter = 0;

            songss = await appDBContext.Songs.ToListAsync();
            albums = await appDBContext.Albums.ToListAsync();

            foreach (var record in list)
            {
                if (firstLine)
                {
                    firstLine = false;
                    continue;
                }

                var spiltRecord = record.Split("\",\"");

                var songname = spiltRecord[1].Trim('\"');

                if (string.IsNullOrEmpty(songname))
                {
                    continue;
                }

                NumberFormatInfo provider = new()
                {
                    NumberDecimalSeparator = "."
                };

                string spotifyId = spiltRecord[0].Trim('\"');
                int.TryParse(spiltRecord[3].Trim('\"'), out int dailyrank);
                int.TryParse(spiltRecord[4].Trim('\"'), out int dailyMovement);
                int.TryParse(spiltRecord[5].Trim('\"'), out int weeklyMovement);
                DateOnly.TryParse(spiltRecord[7].Trim('\"'), out DateOnly snapshotDate);
                int.TryParse(spiltRecord[8].Trim('\"'), out int popularity);
                bool.TryParse(spiltRecord[9].Trim('\"'), out bool isExplicit);
                int.TryParse(spiltRecord[10].Trim('\"'), out int durationMs);
                double.TryParse(spiltRecord[13].Trim('\"'), provider, out double danceability);
                double.TryParse(spiltRecord[14].Trim('\"'), provider, out double energy);
                int.TryParse(spiltRecord[15].Trim('\"'), out int key);
                double.TryParse(spiltRecord[16].Trim('\"'), provider, out double loudness);
                int.TryParse(spiltRecord[17].Trim('\"'), out int mode);
                double.TryParse(spiltRecord[18].Trim('\"'), provider, out double speechiness);
                double.TryParse(spiltRecord[19].Trim('\"'), provider, out double acousticness);
                double.TryParse(spiltRecord[20].Trim('\"'), provider, out double instrumentalness);
                double.TryParse(spiltRecord[21].Trim('\"'), provider, out double liveness);
                double.TryParse(spiltRecord[22].Trim('\"'), provider, out double valence);
                double.TryParse(spiltRecord[23].Trim('\"'), provider, out double tempo);
                int.TryParse(spiltRecord[24].Trim('\"'), out int timeSignature);


                var song = songss.FirstOrDefault(x => x.SpotifyId.ToLower() == spotifyId.ToLower());
                if (song == null)
                {
                    continue;
                }

                Album? album;

                album = albums.FirstOrDefault(x => x.AlbumName == spiltRecord[11].Trim('\"'));

                var rec = new Record()
                {
                    SpotifyId = spotifyId,
                    DailyRank = dailyrank,
                    DailyMovement = dailyMovement,
                    WeeklyMovement = weeklyMovement,
                    Country = spiltRecord[6].Trim('\"'),
                    SnapshotDate = snapshotDate,
                    Popularity = popularity,
                    Spotify = song,
                };

                //song.Album = album;
                //song.AlbumId = album.AlbumId;
                song.Records.Add(rec);

                //foreach (var name in spiltRecord[2].Split(", "))
                //{
                //    if (string.IsNullOrEmpty(name))
                //    {
                //        continue;
                //    }

                //    Artist? artists;
                //    if (name.Trim() == "Theodór Gísli")
                //    {

                //    }
                //    artists = artistss.FirstOrDefault(a => a.Name.Trim().ToLower() == name.Trim().ToLower());

                //    if (artists == null)
                //    {
                //        artists = new Artist()
                //        {
                //            Name = name.TrimStart().TrimEnd(),
                //        };
                //        artistss.Add(artists);
                //    }

                //    song.Artists.Add(artists);
                //}



                //if (album == null)
                //{
                //    DateOnly.TryParse(spiltRecord[12].Trim('\"'), out var relasesdate);
                //    album = new Album()
                //    {
                //        AlbumName = spiltRecord[11].Trim('\"'),
                //        AlbumReleaseDate = relasesdate
                //    };
                //    albums.Add(album);
                //}


                appDBContext.Songs.Update(song);
                counter++;

                if (counter >= 200000)
                {
                    try
                    {
                        var result = await appDBContext.SaveChangesAsync();
                    }
                    catch (Exception ex)
                    {
                        throw;
                    }
                    counter = 0;
                }
            }

            var sda = await appDBContext.SaveChangesAsync();

            return Ok();
        }

        [HttpGet("GetAllRecords")]
        public async Task<IActionResult> GetRecoreds()
        {
            var jsonData = await recordsManager.GetAllRecords();
            return Ok(jsonData);
        }

        [HttpGet("GetRecordBasedOnCountry/{countryCode}")]
        public async Task<IActionResult> GetRecordBasedOnCountry(string countryCode)
        {
            var jsonData = await recordsManager.GetRecordBasedOnCountry(countryCode);
            return Ok(jsonData);
        }

        [HttpGet("GetRecordBasedOnCountryAndDateAndCalculateSongsPoints/{countryCode}")]
        public async Task<IActionResult> GetRecordBasedOnCountryAndDateAndCalculateSongsPoints(string countryCode, [FromQuery] DateOnly startDate, [FromQuery] DateOnly endDate)
        {
            var result = await recordsManager.GetRecordBasedOnCountryAndDateAndCalculateSongsPoints(countryCode, startDate, endDate);
            return Ok(result);
        }

        [HttpGet("GetAllCountryCodes")]
        public async Task<IActionResult> GetAllCountryCodes()
        {
            var countryCodes = await recordsManager.GetAllCountryCodes();
            return Ok(countryCodes);
        }

        [HttpGet("GetArtistPopularityByDate/{artistId}/{date}")]
        public async Task<IActionResult> GetArtistPopularityByDate(int artistId, DateOnly date)
        {
            var result = await recordsManager.GetArtistPopularityByDate(artistId, date);
            return Ok(result);
        }

        [HttpGet("GetTopArtistsAndSongsByCountry/{countryCode}")]
        public async Task<ActionResult<List<NodeDto>>> GetTopArtistsAndSongsByCountry(string countryCode)
        {
            var data = await recordsManager.GetTopArtistsAndSongsByCountry(countryCode);
            return Ok(data);
        }
    }
}
