using System.Text.Json.Serialization;
namespace BigDataApi.Models;

public partial class Artist
{
    public int ArtistId { get; set; }

    public string Name { get; set; } = null!;

    [JsonIgnore]
    public virtual ICollection<Song> Spotifies { get; set; } = new List<Song>();
}
