namespace BigDataApi.Models;

public partial class Record
{
    public int RecordId { get; set; }
    public string SpotifyId { get; set; } = null!;

    public string Name { get; set; } = null!;

    public int? DailyRank { get; set; }

    public int? DailyMovement { get; set; }

    public int? WeeklyMovement { get; set; }

    public string? Country { get; set; }

    public DateOnly? SnapshotDate { get; set; }

    public int? Popularity { get; set; }

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

    public virtual ICollection<Artist> Artists { get; set; } = new List<Artist>();
}
