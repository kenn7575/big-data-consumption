namespace BigDataApi.Models;

public partial class Record
{
    public int RecordId { get; set; }

    public string SpotifyId { get; set; } = null!;

    public int? DailyRank { get; set; }

    public int? DailyMovement { get; set; }

    public int? WeeklyMovement { get; set; }

    public string? Country { get; set; }

    public DateOnly? SnapshotDate { get; set; }

    public int? Popularity { get; set; }

    public virtual Song Spotify { get; set; } = null!;
}
