using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FitnessTracker.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixPersonalRecordCascadeDelete : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PersonalRecords_ExerciseSets_ExerciseSetId",
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

            migrationBuilder.AddForeignKey(
                name: "FK_PersonalRecords_ExerciseSets_ExerciseSetId",
                table: "PersonalRecords",
                column: "ExerciseSetId",
                principalTable: "ExerciseSets",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PersonalRecords_ExerciseSets_ExerciseSetId",
                table: "PersonalRecords");

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

            migrationBuilder.AddForeignKey(
                name: "FK_PersonalRecords_ExerciseSets_ExerciseSetId",
                table: "PersonalRecords",
                column: "ExerciseSetId",
                principalTable: "ExerciseSets",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
