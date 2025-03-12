using System.Text.Json;
using System.Text.Json.Serialization;
using BigDataApi.Data;
using BigDataApi.Dtos;
using BigDataApi.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BigDataApi.Managers
{
    public class SongManager : ISongManager
    {
        private readonly AppDBContext appDBContext;

        public SongManager(AppDBContext appDBContext)
        {
            this.appDBContext = appDBContext;
        }

        public async Task<string> GetSong(string? countryCode, string songId)
        {
            string? countryCodeUpper = countryCode;

            if (countryCodeUpper != null) countryCodeUpper = countryCodeUpper.ToUpper();
            if (countryCodeUpper == "GLOBAL") countryCodeUpper = null;

            var song = await appDBContext.Songs
                .Include(s => s.Album)
                .Include(s => s.Artists)
                .Include(s => s.Records
                    .Where(r => r.Country == countryCodeUpper)
                    .OrderBy(r => r.SnapshotDate)
                )
                .FirstOrDefaultAsync(s => s.SpotifyId == songId);


            var options = new JsonSerializerOptions { WriteIndented = true };

            return JsonSerializer.Serialize(song, options);
        }

        public async Task<string> GetPossibleCountries(string songId)
        {
            var song = await appDBContext.Songs
                .Include(s => s.Records)
                .FirstOrDefaultAsync(s => s.SpotifyId == songId);

            if (song == null) return "Song not found";

            var countries = song.Records.Select(r => r.Country).Distinct().OrderBy(c => c).ToList();

            var options = new JsonSerializerOptions { WriteIndented = true };

            return JsonSerializer.Serialize(countries, options);
        }
    }
}