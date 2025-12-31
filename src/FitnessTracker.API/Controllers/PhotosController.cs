using System.Security.Claims;
using FitnessTracker.API.Filters;
using Asp.Versioning;
using FitnessTracker.Core.Entities;
using FitnessTracker.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace FitnessTracker.API.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
[ApiVersion("1.0")]
[Authorize]
public class PhotosController : ControllerBase
{
    private readonly IPhotoRepository _photoRepository;
    private readonly IMessagePublisher _messagePublisher;
    private readonly ILogger<PhotosController> _logger;
    private readonly IFileStorageService _fileStorage;

    public PhotosController(
        IPhotoRepository photoRepository,
        IMessagePublisher messagePublisher,
        ILogger<PhotosController> logger,
        IFileStorageService fileStorage)
    {
        _photoRepository = photoRepository;
        _messagePublisher = messagePublisher;
        _logger = logger;
        _fileStorage = fileStorage;
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
    [ValidateResourceOwnership]
    public async Task<ActionResult<PhotoDto>> GetPhoto(int id)
    {
        var photo = await _photoRepository.GetByIdAsync(id);
        if (photo == null)
        {
            return NotFound();
        }
        return Ok(MapToDto(photo));
    }

    [HttpGet("{id}/image")]
    public async Task<IActionResult> GetPhotoImage(int id, [FromQuery] string? type = null)
    {
        var photo = await _photoRepository.GetByIdAsync(id);
        if (photo == null)
        {
            return NotFound();
        }

        // CRITICAL: Verify ownership
        var userId = GetUserId();
        if (photo.UserId != userId)
        {
            _logger.LogWarning("User {UserId} attempted to access photo {PhotoId} owned by {OwnerId}",
                userId, id, photo.UserId);
            return Forbid();
        }

        // Determine which image file to serve
        string? fileName = type?.ToLower() switch
        {
            "thumbnail" => photo.ThumbnailPath ?? photo.ImagePath,
            "cropped" => photo.CroppedImagePath ?? photo.ImagePath,
            _ => photo.ImagePath
        };

        if (string.IsNullOrEmpty(fileName))
        {
            return NotFound("No image available for this photo");
        }

        try
        {
            // Extract just the filename (database may store with path prefix like /uploads/file.jpg)
            var fileNameOnly = Path.GetFileName(fileName);

            // Download from storage and stream to client
            var stream = await _fileStorage.GetFileAsync(fileNameOnly);

            // Set caching headers for browser caching (24 hours)
            Response.Headers.Append("Cache-Control", "private, max-age=86400");

            return File(stream, "image/jpeg");
        }
        catch (FileNotFoundException)
        {
            _logger.LogError("Photo {PhotoId} file not found in storage: {FileName}", id, fileName);
            return NotFound("Image file not found in storage");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error streaming photo {PhotoId} from storage", id);
            return StatusCode(500, "Error retrieving image");
        }
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

        // Generate unique filename
        var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";

        // Save file to storage (local or blob)
        await using var stream = file.OpenReadStream();
        var storagePath = await _fileStorage.SaveFileAsync(stream, fileName, file.ContentType);

        // Create database record
        var userId = GetUserId();
        var photo = new ProgressPhoto
        {
            UserId = userId,
            OriginalFileName = file.FileName,
            ImagePath = storagePath, // Store the storage path/filename
            ProcessingStatus = PhotoProcessingStatus.Pending
        };

        var created = await _photoRepository.CreateAsync(photo);
        _logger.LogInformation("Uploaded photo {PhotoId}: {FileName} to storage", created.Id, file.FileName);

        // Queue for processing
        try
        {
            await _messagePublisher.PublishPhotoForProcessingAsync(created.Id, fileName);
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
    [ValidateResourceOwnership]
    public async Task<IActionResult> DeletePhoto(int id)
    {
        var photo = await _photoRepository.GetByIdAsync(id);
        if (photo == null)
        {
            return NotFound();
        }

        // Delete files from storage
        if (!string.IsNullOrEmpty(photo.ImagePath))
        {
            await _fileStorage.DeleteFileAsync(Path.GetFileName(photo.ImagePath));
        }

        if (!string.IsNullOrEmpty(photo.ThumbnailPath))
        {
            await _fileStorage.DeleteFileAsync(Path.GetFileName(photo.ThumbnailPath));
        }

        if (!string.IsNullOrEmpty(photo.CroppedImagePath))
        {
            await _fileStorage.DeleteFileAsync(Path.GetFileName(photo.CroppedImagePath));
        }

        await _photoRepository.DeleteAsync(id);
        return NoContent();
    }

    private PhotoDto MapToDto(ProgressPhoto photo) => new()
    {
        Id = photo.Id,
        OriginalFileName = photo.OriginalFileName,
        ImageUrl = null, // Frontend constructs: /api/v1/photos/{id}/image
        ThumbnailUrl = null, // Frontend constructs: /api/v1/photos/{id}/image?type=thumbnail
        CroppedImageUrl = null, // Frontend constructs: /api/v1/photos/{id}/image?type=cropped
        ProcessingStatus = photo.ProcessingStatus.ToString(),
        ProcessingError = photo.ProcessingError,
        BodyAnalysis = photo.BodyAnalysisJson,
        UploadedAt = photo.UploadedAt,
        PhotoTakenAt = photo.PhotoTakenAt,
        ProcessedAt = photo.ProcessedAt
    };

    [HttpPatch("{id}/date")]
    [ValidateResourceOwnership]
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
    public string? ImageUrl { get; init; }
    public string? ThumbnailUrl { get; init; }
    public string? CroppedImageUrl { get; init; }
    public string ProcessingStatus { get; init; } = string.Empty;
    public string? ProcessingError { get; init; }
    public string? BodyAnalysis { get; init; }
    public DateTime UploadedAt { get; init; }
    public DateTime? PhotoTakenAt { get; init; }
    public DateTime? ProcessedAt { get; init; }
}
