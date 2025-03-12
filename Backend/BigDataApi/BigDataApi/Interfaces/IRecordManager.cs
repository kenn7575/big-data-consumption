using BigDataApi.Dtos;

namespace BigDataApi.Interfaces
{
    public interface IRecordManager
    {
        Task<List<ArtistPopularityDto>> GetArtistPopularityByDate(int artistId, DateOnly date);
        Task<List<RecordDto>> GetRecordBasedOnCountryAndDateAndCalculateSongsPoints(string countryCode, DateOnly startDate, DateOnly endDate);
        Task<string> GetAllRecords();
        Task<string> GetRecordBasedOnCountry(string countryCode);
        Task<List<string>> GetAllCountryCodes();
    }
}
