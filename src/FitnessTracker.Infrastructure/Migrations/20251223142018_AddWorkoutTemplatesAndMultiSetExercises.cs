using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace FitnessTracker.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddWorkoutTemplatesAndMultiSetExercises : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Reps",
                table: "Exercises");

            migrationBuilder.DropColumn(
                name: "Sets",
                table: "Exercises");

            migrationBuilder.DropColumn(
                name: "Weight",
                table: "Exercises");

            migrationBuilder.CreateTable(
                name: "ExerciseSets",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ExerciseId = table.Column<int>(type: "integer", nullable: false),
                    SetNumber = table.Column<int>(type: "integer", nullable: false),
                    Reps = table.Column<int>(type: "integer", nullable: true),
                    Weight = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExerciseSets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ExerciseSets_Exercises_ExerciseId",
                        column: x => x.ExerciseId,
                        principalTable: "Exercises",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WorkoutTemplates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AthleteId = table.Column<int>(type: "integer", nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkoutTemplates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WorkoutTemplates_Athletes_AthleteId",
                        column: x => x.AthleteId,
                        principalTable: "Athletes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TemplateExercises",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    WorkoutTemplateId = table.Column<int>(type: "integer", nullable: false),
                    ExerciseDefinitionId = table.Column<int>(type: "integer", nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    Notes = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TemplateExercises", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TemplateExercises_ExerciseDefinitions_ExerciseDefinitionId",
                        column: x => x.ExerciseDefinitionId,
                        principalTable: "ExerciseDefinitions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TemplateExercises_WorkoutTemplates_WorkoutTemplateId",
                        column: x => x.WorkoutTemplateId,
                        principalTable: "WorkoutTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TemplateSets",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TemplateExerciseId = table.Column<int>(type: "integer", nullable: false),
                    SetNumber = table.Column<int>(type: "integer", nullable: false),
                    TargetReps = table.Column<int>(type: "integer", nullable: true),
                    TargetWeight = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TemplateSets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TemplateSets_TemplateExercises_TemplateExerciseId",
                        column: x => x.TemplateExerciseId,
                        principalTable: "TemplateExercises",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

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

            migrationBuilder.CreateIndex(
                name: "IX_ExerciseSets_ExerciseId",
                table: "ExerciseSets",
                column: "ExerciseId");

            migrationBuilder.CreateIndex(
                name: "IX_TemplateExercises_ExerciseDefinitionId",
                table: "TemplateExercises",
                column: "ExerciseDefinitionId");

            migrationBuilder.CreateIndex(
                name: "IX_TemplateExercises_WorkoutTemplateId",
                table: "TemplateExercises",
                column: "WorkoutTemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_TemplateSets_TemplateExerciseId",
                table: "TemplateSets",
                column: "TemplateExerciseId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkoutTemplates_AthleteId",
                table: "WorkoutTemplates",
                column: "AthleteId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ExerciseSets");

            migrationBuilder.DropTable(
                name: "TemplateSets");

            migrationBuilder.DropTable(
                name: "TemplateExercises");

            migrationBuilder.DropTable(
                name: "WorkoutTemplates");

            migrationBuilder.AddColumn<int>(
                name: "Reps",
                table: "Exercises",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Sets",
                table: "Exercises",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Weight",
                table: "Exercises",
                type: "numeric(10,2)",
                precision: 10,
                scale: 2,
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Athletes",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 23, 13, 33, 15, 783, DateTimeKind.Utc).AddTicks(291));

            migrationBuilder.UpdateData(
                table: "ExerciseDefinitions",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 23, 13, 33, 15, 783, DateTimeKind.Utc).AddTicks(152));

            migrationBuilder.UpdateData(
                table: "ExerciseDefinitions",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 23, 13, 33, 15, 783, DateTimeKind.Utc).AddTicks(155));

            migrationBuilder.UpdateData(
                table: "ExerciseDefinitions",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 23, 13, 33, 15, 783, DateTimeKind.Utc).AddTicks(156));

            migrationBuilder.UpdateData(
                table: "ExerciseDefinitions",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 23, 13, 33, 15, 783, DateTimeKind.Utc).AddTicks(158));
        }
    }
}
