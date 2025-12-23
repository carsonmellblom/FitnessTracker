using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace FitnessTracker.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddExerciseDefinitionCategories : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CategoryId",
                table: "ExerciseDefinitions",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ExerciseDefinitionCategories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExerciseDefinitionCategories", x => x.Id);
                });

            migrationBuilder.UpdateData(
                table: "Athletes",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 23, 15, 28, 39, 243, DateTimeKind.Utc).AddTicks(5664));

            migrationBuilder.InsertData(
                table: "ExerciseDefinitionCategories",
                columns: new[] { "Id", "CreatedAt", "Description", "Name" },
                values: new object[,]
                {
                    { 1, new DateTime(2025, 12, 23, 15, 28, 39, 243, DateTimeKind.Utc).AddTicks(5552), "Resistance and weight training exercises", "Strength Training" },
                    { 2, new DateTime(2025, 12, 23, 15, 28, 39, 243, DateTimeKind.Utc).AddTicks(5554), "Cardiovascular and aerobic exercises", "Cardio" },
                    { 3, new DateTime(2025, 12, 23, 15, 28, 39, 243, DateTimeKind.Utc).AddTicks(5555), "Stretching and mobility exercises", "Flexibility" }
                });

            migrationBuilder.UpdateData(
                table: "ExerciseDefinitions",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CategoryId", "CreatedAt" },
                values: new object[] { 1, new DateTime(2025, 12, 23, 15, 28, 39, 243, DateTimeKind.Utc).AddTicks(5643) });

            migrationBuilder.UpdateData(
                table: "ExerciseDefinitions",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CategoryId", "CreatedAt" },
                values: new object[] { 1, new DateTime(2025, 12, 23, 15, 28, 39, 243, DateTimeKind.Utc).AddTicks(5645) });

            migrationBuilder.UpdateData(
                table: "ExerciseDefinitions",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "CategoryId", "CreatedAt" },
                values: new object[] { 1, new DateTime(2025, 12, 23, 15, 28, 39, 243, DateTimeKind.Utc).AddTicks(5646) });

            migrationBuilder.UpdateData(
                table: "ExerciseDefinitions",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "CategoryId", "CreatedAt" },
                values: new object[] { 1, new DateTime(2025, 12, 23, 15, 28, 39, 243, DateTimeKind.Utc).AddTicks(5647) });

            migrationBuilder.CreateIndex(
                name: "IX_ExerciseDefinitions_CategoryId",
                table: "ExerciseDefinitions",
                column: "CategoryId");

            migrationBuilder.AddForeignKey(
                name: "FK_ExerciseDefinitions_ExerciseDefinitionCategories_CategoryId",
                table: "ExerciseDefinitions",
                column: "CategoryId",
                principalTable: "ExerciseDefinitionCategories",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ExerciseDefinitions_ExerciseDefinitionCategories_CategoryId",
                table: "ExerciseDefinitions");

            migrationBuilder.DropTable(
                name: "ExerciseDefinitionCategories");

            migrationBuilder.DropIndex(
                name: "IX_ExerciseDefinitions_CategoryId",
                table: "ExerciseDefinitions");

            migrationBuilder.DropColumn(
                name: "CategoryId",
                table: "ExerciseDefinitions");

            migrationBuilder.UpdateData(
                table: "Athletes",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 23, 14, 20, 18, 722, DateTimeKind.Utc).AddTicks(4290));

            migrationBuilder.UpdateData(
                table: "ExerciseDefinitions",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 23, 14, 20, 18, 722, DateTimeKind.Utc).AddTicks(4192));

            migrationBuilder.UpdateData(
                table: "ExerciseDefinitions",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 23, 14, 20, 18, 722, DateTimeKind.Utc).AddTicks(4194));

            migrationBuilder.UpdateData(
                table: "ExerciseDefinitions",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 23, 14, 20, 18, 722, DateTimeKind.Utc).AddTicks(4195));

            migrationBuilder.UpdateData(
                table: "ExerciseDefinitions",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 23, 14, 20, 18, 722, DateTimeKind.Utc).AddTicks(4196));
        }
    }
}
