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

        public async Task<string> GetSong(string[]? countries, string songId)
        {
            for (int i = 0; i < countries?.Length; i++)
            {
                if (countries[i] != null) countries[i] = countries[i].ToUpper();
                if (countries[i] == "GLOBAL") countries[i] = null;
            }

            var song = await appDBContext.Songs
                .Include(s => s.Album)
                .Include(s => s.Artists)
                .Include(s => s.Records
                    .Where(r => countries == null || countries.Contains(r.Country))
                    .OrderBy(r => r.SnapshotDate)
                )
                .FirstOrDefaultAsync(s => s.SpotifyId == songId);


            var options = new JsonSerializerOptions { WriteIndented = true };

            return JsonSerializer.Serialize(song, options);
        }

        public async Task<string> GetSongChartData(string[]? countries, string songId)
        {
            for (int i = 0; i < countries?.Length; i++)
            {
                if (countries[i] != null) countries[i] = countries[i].ToUpper();
                if (countries[i] == "GLOBAL") countries[i] = null;
            }

            var song = await appDBContext.Songs
                .Include(s => s.Records
                    .Where(r => countries == null || countries.Contains(r.Country))
                )
                .FirstOrDefaultAsync(s => s.SpotifyId == songId);

            if (song == null) return "{}";

            var grouped = song.Records
                .Where(r => r.SnapshotDate.HasValue)
                .GroupBy(r => r.SnapshotDate!.Value)
                .OrderBy(g => g.Key);

            var chartData = new List<Dictionary<string, object>>();

            foreach (var group in grouped)
            {
                var row = new Dictionary<string, object>
                {
                    ["SnapshotDate"] = group.Key.ToString("yyyy-MM-dd")
                };

                foreach (var record in group)
                {
                    var countryKey = record.Country ?? "Global";
                    row[countryKey] = record.DailyRank ?? 0;
                }

                chartData.Add(row);
            }

            var options = new JsonSerializerOptions { WriteIndented = true };
            return JsonSerializer.Serialize(chartData, options);
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