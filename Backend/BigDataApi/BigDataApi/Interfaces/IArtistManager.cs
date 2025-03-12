using BigDataApi.Dtos;

namespace BigDataApi.Interfaces
{
    public interface IArtistManager
    {
        IEnumerable<ArtistDto> GetAllArtists();
    }
}
