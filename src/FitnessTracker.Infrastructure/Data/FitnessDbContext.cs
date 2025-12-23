using FitnessTracker.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace FitnessTracker.Infrastructure.Data;

public class FitnessDbContext : DbContext
{
    public FitnessDbContext(DbContextOptions<FitnessDbContext> options) : base(options)
    {
    }

    public DbSet<Athlete> Athletes => Set<Athlete>();
    public DbSet<Workout> Workouts => Set<Workout>();
    public DbSet<ExerciseDefinition> ExerciseDefinitions => Set<ExerciseDefinition>();
    public DbSet<Exercise> Exercises => Set<Exercise>();
    public DbSet<ExerciseSet> ExerciseSets => Set<ExerciseSet>();
    public DbSet<WorkoutTemplate> WorkoutTemplates => Set<WorkoutTemplate>();
    public DbSet<TemplateExercise> TemplateExercises => Set<TemplateExercise>();
    public DbSet<TemplateSet> TemplateSets => Set<TemplateSet>();
    public DbSet<ProgressPhoto> ProgressPhotos => Set<ProgressPhoto>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Athlete configuration
        modelBuilder.Entity<Athlete>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Email).HasMaxLength(255).IsRequired();
            entity.HasIndex(e => e.Email).IsUnique();
        });

        // Workout configuration
        modelBuilder.Entity<Workout>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(1000);

            entity.HasOne(e => e.Athlete)
                .WithMany(a => a.Workouts)
                .HasForeignKey(e => e.AthleteId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ExerciseDefinition configuration
        modelBuilder.Entity<ExerciseDefinition>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
            entity.Property(e => e.PrimaryMuscleGroup).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(500);
        });

        // Exercise configuration
        modelBuilder.Entity<Exercise>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Notes).HasMaxLength(500);

            entity.HasOne(e => e.Workout)
                .WithMany(w => w.Exercises)
                .HasForeignKey(e => e.WorkoutId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.ExerciseDefinition)
                .WithMany(ed => ed.Exercises)
                .HasForeignKey(e => e.ExerciseDefinitionId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ProgressPhoto configuration
        modelBuilder.Entity<ProgressPhoto>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.OriginalFileName).HasMaxLength(255).IsRequired();
            entity.Property(e => e.ImagePath).HasMaxLength(500).IsRequired();
            entity.Property(e => e.ThumbnailPath).HasMaxLength(500);
            entity.Property(e => e.ProcessingError).HasMaxLength(1000);
            entity.Property(e => e.BodyAnalysisJson).HasColumnType("jsonb");

            entity.HasOne(e => e.Athlete)
                .WithMany(a => a.ProgressPhotos)
                .HasForeignKey(e => e.AthleteId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ExerciseSet configuration
        modelBuilder.Entity<ExerciseSet>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Weight).HasPrecision(10, 2);

            entity.HasOne(e => e.Exercise)
                .WithMany(ex => ex.Sets)
                .HasForeignKey(e => e.ExerciseId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // WorkoutTemplate configuration
        modelBuilder.Entity<WorkoutTemplate>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(1000);

            entity.HasOne(e => e.Athlete)
                .WithMany()
                .HasForeignKey(e => e.AthleteId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // TemplateExercise configuration
        modelBuilder.Entity<TemplateExercise>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Notes).HasMaxLength(500);

            entity.HasOne(e => e.WorkoutTemplate)
                .WithMany(t => t.Exercises)
                .HasForeignKey(e => e.WorkoutTemplateId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.ExerciseDefinition)
                .WithMany()
                .HasForeignKey(e => e.ExerciseDefinitionId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // TemplateSet configuration
        modelBuilder.Entity<TemplateSet>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.TargetWeight).HasPrecision(10, 2);

            entity.HasOne(e => e.TemplateExercise)
                .WithMany(te => te.TargetSets)
                .HasForeignKey(e => e.TemplateExerciseId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Seed some default exercises
        modelBuilder.Entity<ExerciseDefinition>().HasData(
            new ExerciseDefinition { Id = 1, Name = "Bench Press", PrimaryMuscleGroup = "Chest", Description = "Compound chest exercise" },
            new ExerciseDefinition { Id = 2, Name = "Squat", PrimaryMuscleGroup = "Legs", Description = "Compound leg exercise" },
            new ExerciseDefinition { Id = 3, Name = "Deadlift", PrimaryMuscleGroup = "Back", Description = "Compound full body/back exercise" },
            new ExerciseDefinition { Id = 4, Name = "Overhead Press", PrimaryMuscleGroup = "Shoulders", Description = "Compound shoulder exercise" }
        );

        // Seed a default athlete for testing (no auth)
        modelBuilder.Entity<Athlete>().HasData(
            new Athlete
            {
                Id = 1,
                Name = "Default Athlete",
                Email = "athlete@fitnesstracker.local",
                CreatedAt = DateTime.UtcNow
            }
        );
    }
}
