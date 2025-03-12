namespace BigDataApi.Interfaces
{
    public interface ISongManager
    {
        Task<string> GetSong(string? countryCode, string songId);
        Task<string> GetPossibleCountries(string songId);
    }
}
