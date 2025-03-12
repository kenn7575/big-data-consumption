using BigDataApi.Dtos;

namespace BigDataApi.Interfaces
{
    public interface IArtistManager
    {
        IEnumerable<ArtistDto> GetAllArtists();
        IEnumerable<ArtistDto> GetArtistsByInitial(char initial);
    }
}
