using BigDataApi.Dtos;
using BigDataApi.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace BigDataApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ArtistsController : ControllerBase
    {
        private readonly IArtistManager _artistManager;

        public ArtistsController(IArtistManager artistManager)
        {
            _artistManager = artistManager;
        }

        [HttpGet("GetAllArtists")]
        public ActionResult<IEnumerable<ArtistDto>> GetArtists()
        {
            var artists = _artistManager.GetAllArtists();
            return Ok(artists);
        }
    }
}
