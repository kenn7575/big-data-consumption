using System.Text.Json;
using System.Text.Json.Serialization;
using BigDataApi.Data;
using BigDataApi.Dtos;
using BigDataApi.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BigDataApi.Managers
{
    public class RecordsManager : IRecordManager
    {
        private readonly AppDBContext appDBContext;

        public RecordsManager(AppDBContext appDBContext)
        {
            this.appDBContext = appDBContext;
        }

        public async Task<List<RecordDto>> GetRecordBasedOnCountryAndDateAndCalculateSongsPoints(string countryCode, DateOnly startDate, DateOnly endDate)
        {
            countryCode = countryCode.ToUpper();
            List<RecordDto> result = new List<RecordDto>();

            var data = await appDBContext.Records
                .Where(x => x.Country == countryCode && x.SnapshotDate >= startDate && x.SnapshotDate <= endDate)
                .Include(x => x.Spotify)
                .ToListAsync();

            if (!data.Any())
            {
                return result;
            }

            var dailyData = data
                .Select(record => new RecordDto
                {
                    Name = record.Spotify.Name,
                    Date = record.SnapshotDate.Value,
                    Points = record.DailyRank.HasValue ? record.DailyRank.Value : -51
                })
                .ToList();

            result.AddRange(dailyData);

            return result;
        }

        public async Task<string> GetAllRecords()
        {
            var data = await appDBContext.Records.Take(1000).Include(x => x.Spotify).ToListAsync();

            var options = new JsonSerializerOptions
            {
                ReferenceHandler = ReferenceHandler.Preserve,
                WriteIndented = true
            };

            var jsonData = JsonSerializer.Serialize(data, options);

            return jsonData;
        }

        public async Task<string> GetRecordBasedOnCountry(string countryCode)
        {
            countryCode = countryCode.ToUpper();
            var data = await appDBContext.Records
                .Where(x => x.Country == countryCode)
                .Take(1000)
                .Include(x => x.Spotify)
                .ToListAsync();

            var options = new JsonSerializerOptions
            {
                ReferenceHandler = ReferenceHandler.Preserve,
                WriteIndented = true
            };

            var jsonData = JsonSerializer.Serialize(data, options);

            return jsonData;
        }

        public async Task<List<string>> GetAllCountryCodes()
        {
            var countryCodes = await appDBContext.Records
                .Select(x => x.Country)
                .Distinct()
                .ToListAsync();

            var filteredCountryCodes = countryCodes
                .Where(code => code.Length == 2 && code.All(char.IsUpper))
                .ToList();

            return filteredCountryCodes;
        }
    }
}
