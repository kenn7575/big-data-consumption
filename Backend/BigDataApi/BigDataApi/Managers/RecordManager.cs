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

        public async Task<List<RecordDto>> GetRecordBasedOnCountryAndDateAndCalculateSongsPointsInSevenDaysGroups(string countryCode)
        {
            countryCode = countryCode.ToUpper();
            List<RecordDto> result = new List<RecordDto>();

            var oldestDate = await appDBContext.Records
                .Where(x => x.Country == countryCode)
                .OrderBy(x => x.SnapshotDate)
                .Select(x => x.SnapshotDate)
                .FirstOrDefaultAsync();

            if (oldestDate == null)
            {
                return result;
            }

            DateOnly startDate = oldestDate.Value;

            while (true)
            {
                DateOnly endDate = startDate.AddDays(7);

                var data = await appDBContext.Records
                    .Where(x => x.Country == countryCode && x.SnapshotDate >= startDate && x.SnapshotDate < endDate)
                    .Include(x => x.Spotify)
                    .ToListAsync();

                if (!data.Any())
                {
                    break;
                }

                var groupedData = data
                    .GroupBy(record => record.Spotify.Name)
                    .Select(group => new RecordDto
                    {
                        Name = group.Key,
                        Date = startDate,
                        Points = group.Sum(record => record.DailyRank.HasValue ? record.DailyRank.Value : -51)
                    })
                    .ToList();

                result.AddRange(groupedData);

                startDate = endDate;
            }

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
    }
}
