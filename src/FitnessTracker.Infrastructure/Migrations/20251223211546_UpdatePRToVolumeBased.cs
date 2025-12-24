using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FitnessTracker.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdatePRToVolumeBased : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_PersonalRecords_AthleteId_ExerciseDefinitionId_Weight_Reps",
                table: "PersonalRecords");

            migrationBuilder.UpdateData(
                table: "Athletes",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 23, 21, 15, 46, 558, DateTimeKind.Utc).AddTicks(2534));

            migrationBuilder.UpdateData(
                table: "ExerciseDefinitionCategories",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 23, 21, 15, 46, 558, DateTimeKind.Utc).AddTicks(2319));

            migrationBuilder.UpdateData(
                table: "ExerciseDefinitionCategories",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 23, 21, 15, 46, 558, DateTimeKind.Utc).AddTicks(2323));

            migrationBuilder.UpdateData(
                table: "ExerciseDefinitionCategories",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 23, 21, 15, 46, 558, DateTimeKind.Utc).AddTicks(2324));

            migrationBuilder.UpdateData(
                table: "ExerciseDefinitions",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 23, 21, 15, 46, 558, DateTimeKind.Utc).AddTicks(2509));

            migrationBuilder.UpdateData(
                table: "ExerciseDefinitions",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 23, 21, 15, 46, 558, DateTimeKind.Utc).AddTicks(2512));

            migrationBuilder.UpdateData(
                table: "ExerciseDefinitions",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 23, 21, 15, 46, 558, DateTimeKind.Utc).AddTicks(2513));

            migrationBuilder.UpdateData(
                table: "ExerciseDefinitions",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 23, 21, 15, 46, 558, DateTimeKind.Utc).AddTicks(2514));

            migrationBuilder.CreateIndex(
                name: "IX_PersonalRecords_AthleteId",
                table: "PersonalRecords",
                column: "AthleteId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_PersonalRecords_AthleteId",
                table: "PersonalRecords");

            migrationBuilder.UpdateData(
                table: "Athletes",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 23, 21, 8, 20, 623, DateTimeKind.Utc).AddTicks(4824));

            migrationBuilder.UpdateData(
                table: "ExerciseDefinitionCategories",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 23, 21, 8, 20, 623, DateTimeKind.Utc).AddTicks(4658));

            migrationBuilder.UpdateData(
                table: "ExerciseDefinitionCategories",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 23, 21, 8, 20, 623, DateTimeKind.Utc).AddTicks(4665));

            migrationBuilder.UpdateData(
                table: "ExerciseDefinitionCategories",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 23, 21, 8, 20, 623, DateTimeKind.Utc).AddTicks(4666));

            migrationBuilder.UpdateData(
                table: "ExerciseDefinitions",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 23, 21, 8, 20, 623, DateTimeKind.Utc).AddTicks(4800));

            migrationBuilder.UpdateData(
                table: "ExerciseDefinitions",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 23, 21, 8, 20, 623, DateTimeKind.Utc).AddTicks(4805));

            migrationBuilder.UpdateData(
                table: "ExerciseDefinitions",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 23, 21, 8, 20, 623, DateTimeKind.Utc).AddTicks(4807));

            migrationBuilder.UpdateData(
                table: "ExerciseDefinitions",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 23, 21, 8, 20, 623, DateTimeKind.Utc).AddTicks(4808));

            migrationBuilder.CreateIndex(
                name: "IX_PersonalRecords_AthleteId_ExerciseDefinitionId_Weight_Reps",
                table: "PersonalRecords",
                columns: new[] { "AthleteId", "ExerciseDefinitionId", "Weight", "Reps" },
                unique: true);
        }
    }
}
