namespace FitnessTracker.Core.Entities;

public enum PhotoProcessingStatus
{
    Pending,
    Processing,
    Completed,
    Failed
}

public class ProgressPhoto
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string OriginalFileName { get; set; } = string.Empty;
    public string ImagePath { get; set; } = string.Empty;
    public string? ThumbnailPath { get; set; }
    public string? CroppedImagePath { get; set; }
    public PhotoProcessingStatus ProcessingStatus { get; set; } = PhotoProcessingStatus.Pending;
    public string? ProcessingError { get; set; }

    // Body composition analysis results (from ML processing)
    public string? BodyAnalysisJson { get; set; }

    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
    public DateTime? PhotoTakenAt { get; set; }
    public DateTime? ProcessedAt { get; set; }

    // Navigation property
    public ApplicationUser User { get; set; } = null!;
}
