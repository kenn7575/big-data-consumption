using BigDataApi.Dtos;

namespace BigDataApi.Interfaces
{
    public interface IRecordManager
    {
        Task<List<RecordDto>> GetRecordBasedOnCountryAndDateAndCalculateSongsPointsInSevenDaysGroups(string countryCode);
        Task<string> GetAllRecords();
        Task<string> GetRecordBasedOnCountry(string countryCode);
    }
}
