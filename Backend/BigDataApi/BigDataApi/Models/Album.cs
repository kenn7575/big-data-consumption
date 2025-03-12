using System.Text.Json.Serialization;
namespace BigDataApi.Models;

public partial class Album
{
    public int AlbumId { get; set; }

    public DateOnly? AlbumReleaseDate { get; set; }

    public string? AlbumName { get; set; }

    [JsonIgnore]
    public virtual ICollection<Song> Songs { get; set; } = new List<Song>();
}
