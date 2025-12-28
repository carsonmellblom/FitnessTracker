using System.Security.Claims;
using FitnessTracker.Core.Entities;
using FitnessTracker.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace FitnessTracker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PhotosController : ControllerBase
{
    private readonly IPhotoRepository _photoRepository;
    private readonly IMessagePublisher _messagePublisher;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ILogger<PhotosController> _logger;
    private readonly IWebHostEnvironment _environment;

    public PhotosController(
        IPhotoRepository photoRepository,
        IMessagePublisher messagePublisher,
        UserManager<ApplicationUser> userManager,
        ILogger<PhotosController> logger,
        IWebHostEnvironment environment)
    {
        _photoRepository = photoRepository;
        _messagePublisher = messagePublisher;
        _userManager = userManager;
        _logger = logger;
        _environment = environment;
    }

    private string GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier) ?? throw new UnauthorizedAccessException();

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PhotoDto>>> GetPhotos()
    {
        var userId = GetUserId();
        var photos = await _photoRepository.GetAllAsync(userId);
        return Ok(photos.Select(MapToDto));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PhotoDto>> GetPhoto(int id)
    {
        var photo = await _photoRepository.GetByIdAsync(id);
        if (photo == null)
        {
            return NotFound();
        }
        return Ok(MapToDto(photo));
    }

    [HttpPost]
    public async Task<ActionResult<PhotoDto>> UploadPhoto(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest("No file uploaded");
        }

        // Validate file type
        var allowedTypes = new[] { "image/jpeg", "image/png", "image/webp" };
        if (!allowedTypes.Contains(file.ContentType.ToLower()))
        {
            return BadRequest("Invalid file type. Allowed: JPEG, PNG, WebP");
        }

        // Create uploads directory
        var uploadsPath = Path.Combine(_environment.ContentRootPath, "uploads");
        Directory.CreateDirectory(uploadsPath);

        // Generate unique filename
        var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
        var filePath = Path.Combine(uploadsPath, fileName);

        // Save file
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        // Create database record
        var userId = GetUserId();
        var photo = new ProgressPhoto
        {
            UserId = userId,
            OriginalFileName = file.FileName,
            ImagePath = $"/uploads/{fileName}",
            ProcessingStatus = PhotoProcessingStatus.Pending
        };

        var created = await _photoRepository.CreateAsync(photo);
        _logger.LogInformation("Uploaded photo {PhotoId}: {FileName}", created.Id, file.FileName);

        // Queue for processing
        try
        {
            // Use container path (/app/uploads) instead of Windows path for Docker
            var containerPath = $"/app/uploads/{fileName}";
            await _messagePublisher.PublishPhotoForProcessingAsync(created.Id, containerPath);
            _logger.LogInformation("Queued photo {PhotoId} for processing", created.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to queue photo {PhotoId} for processing", created.Id);
            // Photo is still saved, processing can be retried later
        }

        return CreatedAtAction(nameof(GetPhoto), new { id = created.Id }, MapToDto(created));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePhoto(int id)
    {
        var photo = await _photoRepository.GetByIdAsync(id);
        if (photo == null)
        {
            return NotFound();
        }

        // Delete file from disk
        var uploadsPath = Path.Combine(_environment.ContentRootPath, "uploads");
        var filePath = Path.Combine(uploadsPath, Path.GetFileName(photo.ImagePath));
        if (System.IO.File.Exists(filePath))
        {
            System.IO.File.Delete(filePath);
        }

        // Delete thumbnail if exists
        if (!string.IsNullOrEmpty(photo.ThumbnailPath))
        {
            var thumbPath = Path.Combine(uploadsPath, Path.GetFileName(photo.ThumbnailPath));
            if (System.IO.File.Exists(thumbPath))
            {
                System.IO.File.Delete(thumbPath);
            }
        }

        await _photoRepository.DeleteAsync(id);
        return NoContent();
    }

    private static PhotoDto MapToDto(ProgressPhoto photo) => new()
    {
        Id = photo.Id,
        OriginalFileName = photo.OriginalFileName,
        ImageUrl = photo.ImagePath,
        ThumbnailUrl = photo.ThumbnailPath,
        CroppedImageUrl = photo.CroppedImagePath != null ? $"/uploads/{photo.CroppedImagePath}" : null,
        ProcessingStatus = photo.ProcessingStatus.ToString(),
        ProcessingError = photo.ProcessingError,
        BodyAnalysis = photo.BodyAnalysisJson,
        UploadedAt = photo.UploadedAt,
        PhotoTakenAt = photo.PhotoTakenAt,
        ProcessedAt = photo.ProcessedAt
    };

    [HttpPut("{id}/date")]
    public async Task<IActionResult> UpdatePhotoDate(int id, [FromBody] UpdatePhotoDateRequest request)
    {
        var photo = await _photoRepository.GetByIdAsync(id);
        if (photo == null)
        {
            return NotFound();
        }

        photo.PhotoTakenAt = request.PhotoTakenAt;
        await _photoRepository.UpdateAsync(photo);

        _logger.LogInformation("Updated photo {PhotoId} date to {Date}", id, request.PhotoTakenAt);
        return Ok(MapToDto(photo));
    }
}

public record UpdatePhotoDateRequest
{
    public DateTime PhotoTakenAt { get; init; }
}

public record PhotoDto
{
    public int Id { get; init; }
    public string OriginalFileName { get; init; } = string.Empty;
    public string ImageUrl { get; init; } = string.Empty;
    public string? ThumbnailUrl { get; init; }
    public string? CroppedImageUrl { get; init; }
    public string ProcessingStatus { get; init; } = string.Empty;
    public string? ProcessingError { get; init; }
    public string? BodyAnalysis { get; init; }
    public DateTime UploadedAt { get; init; }
    public DateTime? PhotoTakenAt { get; init; }
    public DateTime? ProcessedAt { get; init; }
}
