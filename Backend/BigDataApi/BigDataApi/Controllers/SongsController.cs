using System.Globalization;
using BigDataApi.Data;
using BigDataApi.Interfaces;
using BigDataApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BigDataApi.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class SongsController : ControllerBase
    {
        private readonly AppDBContext appDBContext;
        private readonly ISongManager songsManager;

        public SongsController(AppDBContext appDBContext, ISongManager songsManager)
        {
            this.appDBContext = appDBContext;
            this.songsManager = songsManager;
        }

        [HttpGet("{songId}")]
        public async Task<IActionResult> GetSong([FromQuery]string[]? Countries, string songId)
        {
            var result = await songsManager.GetSong(Countries, songId);
            return Ok(result);
        }

        [HttpGet("GetSongChartData/{songId}")]
        public async Task<IActionResult> GetSongChartData([FromQuery]string[]? Countries, string songId)
        {
            var result = await songsManager.GetSongChartData(Countries, songId);
            return Ok(result);
        }

        [HttpGet("GetPossibleCountries/{songId}")]
        public async Task<IActionResult> GetPossibleCountries(string songId)
        {
            var result = await songsManager.GetPossibleCountries(songId);
            return Ok(result);
        }
    }
}