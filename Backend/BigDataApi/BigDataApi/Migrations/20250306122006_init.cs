using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace BigDataApi.Migrations
{
    /// <inheritdoc />
    public partial class init : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "albums",
                columns: table => new
                {
                    album_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    album_release_date = table.Column<DateOnly>(type: "date", nullable: true),
                    album_name = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("albums_pkey", x => x.album_id);
                });

            migrationBuilder.CreateTable(
                name: "artists",
                columns: table => new
                {
                    artist_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    name = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("artists_pkey", x => x.artist_id);
                });

            migrationBuilder.CreateTable(
                name: "songs",
                columns: table => new
                {
                    spotify_id = table.Column<string>(type: "text", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    is_explicit = table.Column<bool>(type: "boolean", nullable: true),
                    duration_ms = table.Column<int>(type: "integer", nullable: true),
                    danceability = table.Column<double>(type: "double precision", nullable: true),
                    energy = table.Column<double>(type: "double precision", nullable: true),
                    key = table.Column<int>(type: "integer", nullable: true),
                    loudness = table.Column<double>(type: "double precision", nullable: true),
                    mode = table.Column<int>(type: "integer", nullable: true),
                    speechiness = table.Column<double>(type: "double precision", nullable: true),
                    accusticness = table.Column<double>(type: "double precision", nullable: true),
                    instrumentalness = table.Column<double>(type: "double precision", nullable: true),
                    liveness = table.Column<double>(type: "double precision", nullable: true),
                    valence = table.Column<double>(type: "double precision", nullable: true),
                    tempo = table.Column<double>(type: "double precision", nullable: true),
                    time_signature = table.Column<int>(type: "integer", nullable: true),
                    album_id = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("spotify_id_pk", x => x.spotify_id);
                    table.ForeignKey(
                        name: "album_id_fk",
                        column: x => x.album_id,
                        principalTable: "albums",
                        principalColumn: "album_id");
                });

            migrationBuilder.CreateTable(
                name: "records",
                columns: table => new
                {
                    record_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    spotify_id = table.Column<string>(type: "text", nullable: false),
                    daily_rank = table.Column<int>(type: "integer", nullable: true),
                    daily_movement = table.Column<int>(type: "integer", nullable: true),
                    weekly_movement = table.Column<int>(type: "integer", nullable: true),
                    country = table.Column<string>(type: "text", nullable: true),
                    snapshot_date = table.Column<DateOnly>(type: "date", nullable: true),
                    popularity = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("records_pkey", x => x.record_id);
                    table.ForeignKey(
                        name: "spotify_id",
                        column: x => x.spotify_id,
                        principalTable: "songs",
                        principalColumn: "spotify_id");
                });

            migrationBuilder.CreateTable(
                name: "song_artists",
                columns: table => new
                {
                    spotify_id = table.Column<string>(type: "text", nullable: false),
                    artist_id = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("spotify_artist_pk", x => new { x.spotify_id, x.artist_id });
                    table.ForeignKey(
                        name: "artist_id_fk",
                        column: x => x.artist_id,
                        principalTable: "artists",
                        principalColumn: "artist_id");
                    table.ForeignKey(
                        name: "spotify_id_fk",
                        column: x => x.spotify_id,
                        principalTable: "songs",
                        principalColumn: "spotify_id");
                });

            migrationBuilder.CreateIndex(
                name: "unique_album",
                table: "albums",
                columns: new[] { "album_name", "album_release_date" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "artists_name_key",
                table: "artists",
                column: "name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_records_spotify_id",
                table: "records",
                column: "spotify_id");

            migrationBuilder.CreateIndex(
                name: "unique_record_id",
                table: "records",
                column: "record_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "fki_artist_id_fk",
                table: "song_artists",
                column: "artist_id");

            migrationBuilder.CreateIndex(
                name: "IX_songs_album_id",
                table: "songs",
                column: "album_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "records");

            migrationBuilder.DropTable(
                name: "song_artists");

            migrationBuilder.DropTable(
                name: "artists");

            migrationBuilder.DropTable(
                name: "songs");

            migrationBuilder.DropTable(
                name: "albums");
        }
    }
}
