namespace BigDataApi.Models;

public partial class Album
{
    public int AlbumId { get; set; }

    public DateOnly? AlbumReleaseDate { get; set; }

    public string? AlbumName { get; set; }

    public virtual ICollection<Song> Songs { get; set; } = new List<Song>();
}
