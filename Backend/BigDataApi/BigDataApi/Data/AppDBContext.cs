using BigDataApi.Models;
using Microsoft.EntityFrameworkCore;

namespace BigDataApi.Data
{
    public class AppDBContext : DbContext
    {
        public AppDBContext(DbContextOptions dbContextOptions) : base(dbContextOptions)
        {

        }

        public virtual DbSet<Artist> Artists { get; set; }

        public virtual DbSet<Record> Records { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Artist>(entity =>
            {
                entity.HasKey(e => e.ArtistId).HasName("artists_pkey");

                entity.ToTable("artists");

                entity.HasIndex(e => e.Name, "artists_name_key").IsUnique();

                entity.Property(e => e.ArtistId).HasColumnName("artist_id");
                entity.Property(e => e.Name).HasColumnName("name");
            });

            modelBuilder.Entity<Record>(entity =>
            {
                entity.HasKey(e => e.RecordId).HasName("records_pkey");

                entity.ToTable("records");

                entity.Property(e => e.RecordId).HasColumnName("record_id");
                entity.Property(e => e.SpotifyId).HasColumnName("spotify_id");
                entity.Property(e => e.Acousticness).HasColumnName("acousticness");
                entity.Property(e => e.Country).HasColumnName("country");
                entity.Property(e => e.DailyMovement).HasColumnName("daily_movement");
                entity.Property(e => e.DailyRank).HasColumnName("daily_rank");
                entity.Property(e => e.Danceability).HasColumnName("danceability");
                entity.Property(e => e.DurationMs).HasColumnName("duration_ms");
                entity.Property(e => e.Energy).HasColumnName("energy");
                entity.Property(e => e.Instrumentalness).HasColumnName("instrumentalness");
                entity.Property(e => e.IsExplicit).HasColumnName("is_explicit");
                entity.Property(e => e.Key).HasColumnName("key");
                entity.Property(e => e.Liveness).HasColumnName("liveness");
                entity.Property(e => e.Loudness).HasColumnName("loudness");
                entity.Property(e => e.Mode).HasColumnName("mode");
                entity.Property(e => e.Name).HasColumnName("name");
                entity.Property(e => e.Popularity).HasColumnName("popularity");
                entity.Property(e => e.SnapshotDate).HasColumnName("snapshot_date");
                entity.Property(e => e.Speechiness).HasColumnName("speechiness");
                entity.Property(e => e.Tempo).HasColumnName("tempo");
                entity.Property(e => e.TimeSignature).HasColumnName("time_signature");
                entity.Property(e => e.Valence).HasColumnName("valence");
                entity.Property(e => e.WeeklyMovement).HasColumnName("weekly_movement");

                entity.HasMany(d => d.Artists).WithMany(p => p.Records)
                    .UsingEntity<Dictionary<string, object>>(
                        "RecordArtist",
                        r => r.HasOne<Artist>().WithMany()
                            .HasForeignKey("ArtistId")
                            .HasConstraintName("record_artists_artist_id_fkey"),
                        l => l.HasOne<Record>().WithMany()
                            .HasForeignKey("RecordId")
                            .HasConstraintName("record_artists_record_id_fkey"),
                        j =>
                        {
                            j.HasKey("RecordId", "ArtistId").HasName("record_artists_pkey");
                            j.ToTable("record_artists");
                            j.IndexerProperty<string>("RecordId").HasColumnName("record_id");
                            j.IndexerProperty<int>("ArtistId").HasColumnName("artist_id");
                        });
            });
        }
    }
}
