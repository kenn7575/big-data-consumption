using BigDataApi.Models;
using Microsoft.EntityFrameworkCore;

namespace BigDataApi.Data
{
    public class AppDBContext : DbContext
    {
        public AppDBContext(DbContextOptions dbContextOptions) : base(dbContextOptions)
        {

        }

        public virtual DbSet<Album> Albums { get; set; }

        public virtual DbSet<Artist> Artists { get; set; }

        public virtual DbSet<Record> Records { get; set; }

        public virtual DbSet<Song> Songs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.HasPostgresExtension("cstore_fdw");

            modelBuilder.Entity<Album>(entity =>
            {
                entity.HasKey(e => e.AlbumId).HasName("albums_pkey");

                entity.ToTable("albums");

                entity.HasIndex(e => new { e.AlbumName, e.AlbumReleaseDate }, "unique_album").IsUnique();

                entity.Property(e => e.AlbumId).HasColumnName("album_id");
                entity.Property(e => e.AlbumName).HasColumnName("album_name");
                entity.Property(e => e.AlbumReleaseDate).HasColumnName("album_release_date");
            });

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

                entity.HasIndex(e => e.RecordId, "unique_record_id").IsUnique();

                entity.Property(e => e.RecordId).HasColumnName("record_id");
                entity.Property(e => e.Country).HasColumnName("country");
                entity.Property(e => e.DailyMovement).HasColumnName("daily_movement");
                entity.Property(e => e.DailyRank).HasColumnName("daily_rank");
                entity.Property(e => e.Popularity).HasColumnName("popularity");
                entity.Property(e => e.SnapshotDate).HasColumnName("snapshot_date");
                entity.Property(e => e.SpotifyId).HasColumnName("spotify_id");
                entity.Property(e => e.WeeklyMovement).HasColumnName("weekly_movement");

                entity.HasOne(d => d.Spotify).WithMany(p => p.Records)
                    .HasForeignKey(d => d.SpotifyId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("spotify_id");
            });

            modelBuilder.Entity<Song>(entity =>
            {
                entity.HasKey(e => e.SpotifyId).HasName("spotify_id_pk");

                entity.ToTable("songs");

                entity.Property(e => e.SpotifyId).HasColumnName("spotify_id");
                entity.Property(e => e.Accusticness).HasColumnName("accusticness");
                entity.Property(e => e.AlbumId).HasColumnName("album_id");
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
                entity.Property(e => e.Speechiness).HasColumnName("speechiness");
                entity.Property(e => e.Tempo).HasColumnName("tempo");
                entity.Property(e => e.TimeSignature).HasColumnName("time_signature");
                entity.Property(e => e.Valence).HasColumnName("valence");

                entity.HasOne(d => d.Album).WithMany(p => p.Songs)
                    .HasForeignKey(d => d.AlbumId)
                    .HasConstraintName("album_id_fk");

                entity.HasMany(d => d.Artists).WithMany(p => p.Spotifies)
                    .UsingEntity<Dictionary<string, object>>(
                        "SongArtist",
                        r => r.HasOne<Artist>().WithMany()
                            .HasForeignKey("ArtistId")
                            .OnDelete(DeleteBehavior.ClientSetNull)
                            .HasConstraintName("artist_id_fk"),
                        l => l.HasOne<Song>().WithMany()
                            .HasForeignKey("SpotifyId")
                            .OnDelete(DeleteBehavior.ClientSetNull)
                            .HasConstraintName("spotify_id_fk"),
                        j =>
                        {
                            j.HasKey("SpotifyId", "ArtistId").HasName("spotify_artist_pk");
                            j.ToTable("song_artists");
                            j.HasIndex(new[] { "ArtistId" }, "fki_artist_id_fk");
                            j.IndexerProperty<string>("SpotifyId").HasColumnName("spotify_id");
                            j.IndexerProperty<int>("ArtistId").HasColumnName("artist_id");
                        });
            });
        }
    }
}
