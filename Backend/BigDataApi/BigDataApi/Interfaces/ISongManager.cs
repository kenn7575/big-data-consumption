namespace BigDataApi.Interfaces
{
    public interface ISongManager
    {
        Task<string> GetSongs(string search = "", int limit = 100);
        Task<string> GetSong(string[]? countries, string songId);
        Task<string> GetSongChartData(string[]? countries, string songId);
        Task<string> GetPossibleCountries(string songId);
    }
}
