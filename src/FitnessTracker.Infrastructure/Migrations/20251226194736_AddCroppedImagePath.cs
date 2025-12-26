using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FitnessTracker.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCroppedImagePath : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CroppedImagePath",
                table: "ProgressPhotos",
                type: "text",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Athletes",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 26, 19, 47, 36, 368, DateTimeKind.Utc).AddTicks(8538));

            migrationBuilder.UpdateData(
                table: "ExerciseDefinitionCategories",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 26, 19, 47, 36, 368, DateTimeKind.Utc).AddTicks(8409));

            migrationBuilder.UpdateData(
                table: "ExerciseDefinitionCategories",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 26, 19, 47, 36, 368, DateTimeKind.Utc).AddTicks(8411));

            migrationBuilder.UpdateData(
                table: "ExerciseDefinitionCategories",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 26, 19, 47, 36, 368, DateTimeKind.Utc).AddTicks(8412));

            migrationBuilder.UpdateData(
                table: "ExerciseDefinitions",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 26, 19, 47, 36, 368, DateTimeKind.Utc).AddTicks(8513));

            migrationBuilder.UpdateData(
                table: "ExerciseDefinitions",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 26, 19, 47, 36, 368, DateTimeKind.Utc).AddTicks(8517));

            migrationBuilder.UpdateData(
                table: "ExerciseDefinitions",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 26, 19, 47, 36, 368, DateTimeKind.Utc).AddTicks(8518));

            migrationBuilder.UpdateData(
                table: "ExerciseDefinitions",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 26, 19, 47, 36, 368, DateTimeKind.Utc).AddTicks(8519));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CroppedImagePath",
                table: "ProgressPhotos");

            migrationBuilder.UpdateData(
                table: "Athletes",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 26, 19, 32, 4, 414, DateTimeKind.Utc).AddTicks(8474));

            migrationBuilder.UpdateData(
                table: "ExerciseDefinitionCategories",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 26, 19, 32, 4, 414, DateTimeKind.Utc).AddTicks(8337));

            migrationBuilder.UpdateData(
                table: "ExerciseDefinitionCategories",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 26, 19, 32, 4, 414, DateTimeKind.Utc).AddTicks(8340));

            migrationBuilder.UpdateData(
                table: "ExerciseDefinitionCategories",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 26, 19, 32, 4, 414, DateTimeKind.Utc).AddTicks(8341));

            migrationBuilder.UpdateData(
                table: "ExerciseDefinitions",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 26, 19, 32, 4, 414, DateTimeKind.Utc).AddTicks(8451));

            migrationBuilder.UpdateData(
                table: "ExerciseDefinitions",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 26, 19, 32, 4, 414, DateTimeKind.Utc).AddTicks(8455));

            migrationBuilder.UpdateData(
                table: "ExerciseDefinitions",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 26, 19, 32, 4, 414, DateTimeKind.Utc).AddTicks(8456));

            migrationBuilder.UpdateData(
                table: "ExerciseDefinitions",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 26, 19, 32, 4, 414, DateTimeKind.Utc).AddTicks(8457));
        }
    }
}
