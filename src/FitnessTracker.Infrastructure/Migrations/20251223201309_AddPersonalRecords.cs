using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace FitnessTracker.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPersonalRecords : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PersonalRecords",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AthleteId = table.Column<int>(type: "integer", nullable: false),
                    ExerciseDefinitionId = table.Column<int>(type: "integer", nullable: false),
                    Weight = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    Reps = table.Column<int>(type: "integer", nullable: false),
                    AchievedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    WorkoutId = table.Column<int>(type: "integer", nullable: false),
                    ExerciseSetId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PersonalRecords", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PersonalRecords_Athletes_AthleteId",
                        column: x => x.AthleteId,
                        principalTable: "Athletes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PersonalRecords_ExerciseDefinitions_ExerciseDefinitionId",
                        column: x => x.ExerciseDefinitionId,
                        principalTable: "ExerciseDefinitions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PersonalRecords_ExerciseSets_ExerciseSetId",
                        column: x => x.ExerciseSetId,
                        principalTable: "ExerciseSets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PersonalRecords_Workouts_WorkoutId",
                        column: x => x.WorkoutId,
                        principalTable: "Workouts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.UpdateData(
                table: "Athletes",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 23, 20, 13, 9, 579, DateTimeKind.Utc).AddTicks(8221));

            migrationBuilder.UpdateData(
                table: "ExerciseDefinitionCategories",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 23, 20, 13, 9, 579, DateTimeKind.Utc).AddTicks(8089));

            migrationBuilder.UpdateData(
                table: "ExerciseDefinitionCategories",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 23, 20, 13, 9, 579, DateTimeKind.Utc).AddTicks(8090));

            migrationBuilder.UpdateData(
                table: "ExerciseDefinitionCategories",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 23, 20, 13, 9, 579, DateTimeKind.Utc).AddTicks(8091));

            migrationBuilder.UpdateData(
                table: "ExerciseDefinitions",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 23, 20, 13, 9, 579, DateTimeKind.Utc).AddTicks(8199));

            migrationBuilder.UpdateData(
                table: "ExerciseDefinitions",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 23, 20, 13, 9, 579, DateTimeKind.Utc).AddTicks(8202));

            migrationBuilder.UpdateData(
                table: "ExerciseDefinitions",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 23, 20, 13, 9, 579, DateTimeKind.Utc).AddTicks(8203));

            migrationBuilder.UpdateData(
                table: "ExerciseDefinitions",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 23, 20, 13, 9, 579, DateTimeKind.Utc).AddTicks(8204));

            migrationBuilder.CreateIndex(
                name: "IX_PersonalRecords_AthleteId_ExerciseDefinitionId_Weight_Reps",
                table: "PersonalRecords",
                columns: new[] { "AthleteId", "ExerciseDefinitionId", "Weight", "Reps" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PersonalRecords_ExerciseDefinitionId",
                table: "PersonalRecords",
                column: "ExerciseDefinitionId");

            migrationBuilder.CreateIndex(
                name: "IX_PersonalRecords_ExerciseSetId",
                table: "PersonalRecords",
                column: "ExerciseSetId");

            migrationBuilder.CreateIndex(
                name: "IX_PersonalRecords_WorkoutId",
                table: "PersonalRecords",
                column: "WorkoutId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PersonalRecords");

            migrationBuilder.UpdateData(
                table: "Athletes",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 23, 15, 28, 39, 243, DateTimeKind.Utc).AddTicks(5664));

            migrationBuilder.UpdateData(
                table: "ExerciseDefinitionCategories",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 23, 15, 28, 39, 243, DateTimeKind.Utc).AddTicks(5552));

            migrationBuilder.UpdateData(
                table: "ExerciseDefinitionCategories",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 23, 15, 28, 39, 243, DateTimeKind.Utc).AddTicks(5554));

            migrationBuilder.UpdateData(
                table: "ExerciseDefinitionCategories",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 23, 15, 28, 39, 243, DateTimeKind.Utc).AddTicks(5555));

            migrationBuilder.UpdateData(
                table: "ExerciseDefinitions",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 23, 15, 28, 39, 243, DateTimeKind.Utc).AddTicks(5643));

            migrationBuilder.UpdateData(
                table: "ExerciseDefinitions",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 23, 15, 28, 39, 243, DateTimeKind.Utc).AddTicks(5645));

            migrationBuilder.UpdateData(
                table: "ExerciseDefinitions",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 23, 15, 28, 39, 243, DateTimeKind.Utc).AddTicks(5646));

            migrationBuilder.UpdateData(
                table: "ExerciseDefinitions",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 23, 15, 28, 39, 243, DateTimeKind.Utc).AddTicks(5647));
        }
    }
}
