using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace FitnessTracker.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddExerciseDefinitions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Name",
                table: "Exercises");

            migrationBuilder.AddColumn<int>(
                name: "ExerciseDefinitionId",
                table: "Exercises",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "ExerciseDefinitions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    PrimaryMuscleGroup = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExerciseDefinitions", x => x.Id);
                });

            migrationBuilder.UpdateData(
                table: "Athletes",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 23, 13, 33, 15, 783, DateTimeKind.Utc).AddTicks(291));

            migrationBuilder.InsertData(
                table: "ExerciseDefinitions",
                columns: new[] { "Id", "CreatedAt", "Description", "Name", "PrimaryMuscleGroup" },
                values: new object[,]
                {
                    { 1, new DateTime(2025, 12, 23, 13, 33, 15, 783, DateTimeKind.Utc).AddTicks(152), "Compound chest exercise", "Bench Press", "Chest" },
                    { 2, new DateTime(2025, 12, 23, 13, 33, 15, 783, DateTimeKind.Utc).AddTicks(155), "Compound leg exercise", "Squat", "Legs" },
                    { 3, new DateTime(2025, 12, 23, 13, 33, 15, 783, DateTimeKind.Utc).AddTicks(156), "Compound full body/back exercise", "Deadlift", "Back" },
                    { 4, new DateTime(2025, 12, 23, 13, 33, 15, 783, DateTimeKind.Utc).AddTicks(158), "Compound shoulder exercise", "Overhead Press", "Shoulders" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Exercises_ExerciseDefinitionId",
                table: "Exercises",
                column: "ExerciseDefinitionId");

            migrationBuilder.AddForeignKey(
                name: "FK_Exercises_ExerciseDefinitions_ExerciseDefinitionId",
                table: "Exercises",
                column: "ExerciseDefinitionId",
                principalTable: "ExerciseDefinitions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Exercises_ExerciseDefinitions_ExerciseDefinitionId",
                table: "Exercises");

            migrationBuilder.DropTable(
                name: "ExerciseDefinitions");

            migrationBuilder.DropIndex(
                name: "IX_Exercises_ExerciseDefinitionId",
                table: "Exercises");

            migrationBuilder.DropColumn(
                name: "ExerciseDefinitionId",
                table: "Exercises");

            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "Exercises",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.UpdateData(
                table: "Athletes",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 22, 20, 14, 8, 961, DateTimeKind.Utc).AddTicks(5912));
        }
    }
}
