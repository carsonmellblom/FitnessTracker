using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FitnessTracker.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdatePRToRepBased : Migration
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
                value: new DateTime(2025, 12, 23, 21, 40, 27, 516, DateTimeKind.Utc).AddTicks(6806));

            migrationBuilder.UpdateData(
                table: "ExerciseDefinitionCategories",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 23, 21, 40, 27, 516, DateTimeKind.Utc).AddTicks(6664));

            migrationBuilder.UpdateData(
                table: "ExerciseDefinitionCategories",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 23, 21, 40, 27, 516, DateTimeKind.Utc).AddTicks(6666));

            migrationBuilder.UpdateData(
                table: "ExerciseDefinitionCategories",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 23, 21, 40, 27, 516, DateTimeKind.Utc).AddTicks(6667));

            migrationBuilder.UpdateData(
                table: "ExerciseDefinitions",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 23, 21, 40, 27, 516, DateTimeKind.Utc).AddTicks(6781));

            migrationBuilder.UpdateData(
                table: "ExerciseDefinitions",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 23, 21, 40, 27, 516, DateTimeKind.Utc).AddTicks(6784));

            migrationBuilder.UpdateData(
                table: "ExerciseDefinitions",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 23, 21, 40, 27, 516, DateTimeKind.Utc).AddTicks(6786));

            migrationBuilder.UpdateData(
                table: "ExerciseDefinitions",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 23, 21, 40, 27, 516, DateTimeKind.Utc).AddTicks(6787));

            migrationBuilder.CreateIndex(
                name: "IX_PersonalRecords_AthleteId_ExerciseDefinitionId_Reps",
                table: "PersonalRecords",
                columns: new[] { "AthleteId", "ExerciseDefinitionId", "Reps" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_PersonalRecords_AthleteId_ExerciseDefinitionId_Reps",
                table: "PersonalRecords");

            migrationBuilder.UpdateData(
                table: "Athletes",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 23, 21, 21, 20, 750, DateTimeKind.Utc).AddTicks(6558));

            migrationBuilder.UpdateData(
                table: "ExerciseDefinitionCategories",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 23, 21, 21, 20, 750, DateTimeKind.Utc).AddTicks(6420));

            migrationBuilder.UpdateData(
                table: "ExerciseDefinitionCategories",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 23, 21, 21, 20, 750, DateTimeKind.Utc).AddTicks(6422));

            migrationBuilder.UpdateData(
                table: "ExerciseDefinitionCategories",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 23, 21, 21, 20, 750, DateTimeKind.Utc).AddTicks(6423));

            migrationBuilder.UpdateData(
                table: "ExerciseDefinitions",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 23, 21, 21, 20, 750, DateTimeKind.Utc).AddTicks(6533));

            migrationBuilder.UpdateData(
                table: "ExerciseDefinitions",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 23, 21, 21, 20, 750, DateTimeKind.Utc).AddTicks(6537));

            migrationBuilder.UpdateData(
                table: "ExerciseDefinitions",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 23, 21, 21, 20, 750, DateTimeKind.Utc).AddTicks(6538));

            migrationBuilder.UpdateData(
                table: "ExerciseDefinitions",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 23, 21, 21, 20, 750, DateTimeKind.Utc).AddTicks(6540));

            migrationBuilder.CreateIndex(
                name: "IX_PersonalRecords_AthleteId_ExerciseDefinitionId_Weight_Reps",
                table: "PersonalRecords",
                columns: new[] { "AthleteId", "ExerciseDefinitionId", "Weight", "Reps" },
                unique: true);
        }
    }
}
