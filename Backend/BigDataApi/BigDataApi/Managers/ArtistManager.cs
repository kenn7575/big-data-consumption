﻿using BigDataApi.Data;
using BigDataApi.Dtos;
using BigDataApi.Interfaces;

namespace BigDataApi.Managers
{
    public class ArtistManager : IArtistManager
    {
        private readonly AppDBContext _context;

        public ArtistManager(AppDBContext context)
        {
            _context = context;
        }

        public IEnumerable<ArtistDto> GetAllArtists()
        {
            return _context.Artists
                .Select(a => new ArtistDto
                {
                    ArtistId = a.ArtistId,
                    Name = a.Name
                })
                .ToList();
        }
        public IEnumerable<ArtistDto> GetArtistsByInitial(char initial)
        {
            return _context.Artists
                .AsEnumerable()
                .Where(a => a.Name.StartsWith(initial.ToString(), StringComparison.OrdinalIgnoreCase))
                .Select(a => new ArtistDto
                {
                    ArtistId = a.ArtistId,
                    Name = a.Name
                })
                .ToList();
        }
    }

}
