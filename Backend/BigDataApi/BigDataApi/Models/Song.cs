namespace BigDataApi.Models;

public partial class Song
{
    public string SpotifyId { get; set; } = null!;

    public string Name { get; set; } = null!;

    public bool? IsExplicit { get; set; }

    public int? DurationMs { get; set; }

    public double? Danceability { get; set; }

    public double? Energy { get; set; }

    public int? Key { get; set; }

    public double? Loudness { get; set; }

    public int? Mode { get; set; }

    public double? Speechiness { get; set; }

    public double? Acousticness { get; set; }

    public double? Instrumentalness { get; set; }

    public double? Liveness { get; set; }

    public double? Valence { get; set; }

    public double? Tempo { get; set; }

    public int? TimeSignature { get; set; }

    public int? AlbumId { get; set; }

    public virtual Album? Album { get; set; }

    public virtual ICollection<Record> Records { get; set; } = new List<Record>();

    public virtual ICollection<Artist> Artists { get; set; } = new List<Artist>();
}
