﻿// <auto-generated />
using System;
using BigDataApi.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace BigDataApi.Migrations
{
    [DbContext(typeof(AppDBContext))]
    [Migration("20250306122006_init")]
    partial class init
    {
        /// <inheritdoc />
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "9.0.2")
                .HasAnnotation("Relational:MaxIdentifierLength", 63);

            NpgsqlModelBuilderExtensions.UseIdentityByDefaultColumns(modelBuilder);

            modelBuilder.Entity("BigDataApi.Models.Album", b =>
                {
                    b.Property<int>("AlbumId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer")
                        .HasColumnName("album_id");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("AlbumId"));

                    b.Property<string>("AlbumName")
                        .HasColumnType("text")
                        .HasColumnName("album_name");

                    b.Property<DateOnly?>("AlbumReleaseDate")
                        .HasColumnType("date")
                        .HasColumnName("album_release_date");

                    b.HasKey("AlbumId")
                        .HasName("albums_pkey");

                    b.HasIndex(new[] { "AlbumName", "AlbumReleaseDate" }, "unique_album")
                        .IsUnique();

                    b.ToTable("albums", (string)null);
                });

            modelBuilder.Entity("BigDataApi.Models.Artist", b =>
                {
                    b.Property<int>("ArtistId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer")
                        .HasColumnName("artist_id");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("ArtistId"));

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text")
                        .HasColumnName("name");

                    b.HasKey("ArtistId")
                        .HasName("artists_pkey");

                    b.HasIndex(new[] { "Name" }, "artists_name_key")
                        .IsUnique();

                    b.ToTable("artists", (string)null);
                });

            modelBuilder.Entity("BigDataApi.Models.Record", b =>
                {
                    b.Property<int>("RecordId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer")
                        .HasColumnName("record_id");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("RecordId"));

                    b.Property<string>("Country")
                        .HasColumnType("text")
                        .HasColumnName("country");

                    b.Property<int?>("DailyMovement")
                        .HasColumnType("integer")
                        .HasColumnName("daily_movement");

                    b.Property<int?>("DailyRank")
                        .HasColumnType("integer")
                        .HasColumnName("daily_rank");

                    b.Property<int?>("Popularity")
                        .HasColumnType("integer")
                        .HasColumnName("popularity");

                    b.Property<DateOnly?>("SnapshotDate")
                        .HasColumnType("date")
                        .HasColumnName("snapshot_date");

                    b.Property<string>("SpotifyId")
                        .IsRequired()
                        .HasColumnType("text")
                        .HasColumnName("spotify_id");

                    b.Property<int?>("WeeklyMovement")
                        .HasColumnType("integer")
                        .HasColumnName("weekly_movement");

                    b.HasKey("RecordId")
                        .HasName("records_pkey");

                    b.HasIndex("SpotifyId");

                    b.HasIndex(new[] { "RecordId" }, "unique_record_id")
                        .IsUnique();

                    b.ToTable("records", (string)null);
                });

            modelBuilder.Entity("BigDataApi.Models.Song", b =>
                {
                    b.Property<string>("SpotifyId")
                        .HasColumnType("text")
                        .HasColumnName("spotify_id");

                    b.Property<double?>("Accusticness")
                        .HasColumnType("double precision")
                        .HasColumnName("accusticness");

                    b.Property<int?>("AlbumId")
                        .HasColumnType("integer")
                        .HasColumnName("album_id");

                    b.Property<double?>("Danceability")
                        .HasColumnType("double precision")
                        .HasColumnName("danceability");

                    b.Property<int?>("DurationMs")
                        .HasColumnType("integer")
                        .HasColumnName("duration_ms");

                    b.Property<double?>("Energy")
                        .HasColumnType("double precision")
                        .HasColumnName("energy");

                    b.Property<double?>("Instrumentalness")
                        .HasColumnType("double precision")
                        .HasColumnName("instrumentalness");

                    b.Property<bool?>("IsExplicit")
                        .HasColumnType("boolean")
                        .HasColumnName("is_explicit");

                    b.Property<int?>("Key")
                        .HasColumnType("integer")
                        .HasColumnName("key");

                    b.Property<double?>("Liveness")
                        .HasColumnType("double precision")
                        .HasColumnName("liveness");

                    b.Property<double?>("Loudness")
                        .HasColumnType("double precision")
                        .HasColumnName("loudness");

                    b.Property<int?>("Mode")
                        .HasColumnType("integer")
                        .HasColumnName("mode");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text")
                        .HasColumnName("name");

                    b.Property<double?>("Speechiness")
                        .HasColumnType("double precision")
                        .HasColumnName("speechiness");

                    b.Property<double?>("Tempo")
                        .HasColumnType("double precision")
                        .HasColumnName("tempo");

                    b.Property<int?>("TimeSignature")
                        .HasColumnType("integer")
                        .HasColumnName("time_signature");

                    b.Property<double?>("Valence")
                        .HasColumnType("double precision")
                        .HasColumnName("valence");

                    b.HasKey("SpotifyId")
                        .HasName("spotify_id_pk");

                    b.HasIndex("AlbumId");

                    b.ToTable("songs", (string)null);
                });

            modelBuilder.Entity("SongArtist", b =>
                {
                    b.Property<string>("SpotifyId")
                        .HasColumnType("text")
                        .HasColumnName("spotify_id");

                    b.Property<int>("ArtistId")
                        .HasColumnType("integer")
                        .HasColumnName("artist_id");

                    b.HasKey("SpotifyId", "ArtistId")
                        .HasName("spotify_artist_pk");

                    b.HasIndex(new[] { "ArtistId" }, "fki_artist_id_fk");

                    b.ToTable("song_artists", (string)null);
                });

            modelBuilder.Entity("BigDataApi.Models.Record", b =>
                {
                    b.HasOne("BigDataApi.Models.Song", "Spotify")
                        .WithMany("Records")
                        .HasForeignKey("SpotifyId")
                        .IsRequired()
                        .HasConstraintName("spotify_id");

                    b.Navigation("Spotify");
                });

            modelBuilder.Entity("BigDataApi.Models.Song", b =>
                {
                    b.HasOne("BigDataApi.Models.Album", "Album")
                        .WithMany("Songs")
                        .HasForeignKey("AlbumId")
                        .HasConstraintName("album_id_fk");

                    b.Navigation("Album");
                });

            modelBuilder.Entity("SongArtist", b =>
                {
                    b.HasOne("BigDataApi.Models.Artist", null)
                        .WithMany()
                        .HasForeignKey("ArtistId")
                        .IsRequired()
                        .HasConstraintName("artist_id_fk");

                    b.HasOne("BigDataApi.Models.Song", null)
                        .WithMany()
                        .HasForeignKey("SpotifyId")
                        .IsRequired()
                        .HasConstraintName("spotify_id_fk");
                });

            modelBuilder.Entity("BigDataApi.Models.Album", b =>
                {
                    b.Navigation("Songs");
                });

            modelBuilder.Entity("BigDataApi.Models.Song", b =>
                {
                    b.Navigation("Records");
                });
#pragma warning restore 612, 618
        }
    }
}
