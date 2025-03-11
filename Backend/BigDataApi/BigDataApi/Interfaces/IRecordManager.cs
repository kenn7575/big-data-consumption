using BigDataApi.Dtos;

namespace BigDataApi.Interfaces
{
    public interface IRecordManager
    {
        Task<List<RecordDto>> GetRecordBasedOnCountryAndDateAndCalculateSongsPoints(string countryCode);
        Task<string> GetAllRecords();
        Task<string> GetRecordBasedOnCountry(string countryCode);
        Task<List<string>> GetAllCountryCodes();
    }
}
