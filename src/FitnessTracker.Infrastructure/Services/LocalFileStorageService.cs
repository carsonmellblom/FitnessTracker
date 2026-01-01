using FitnessTracker.Core.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace FitnessTracker.Infrastructure.Services;

/// <summary>
/// Local file system storage implementation for development
/// </summary>
public class LocalFileStorageService : IFileStorageService
{
    private readonly string _uploadsPath;
    private readonly ILogger<LocalFileStorageService> _logger;

    public LocalFileStorageService(IConfiguration configuration, ILogger<LocalFileStorageService> logger)
    {
        _logger = logger;
        _uploadsPath = configuration["FileStorage:LocalPath"] ?? "./uploads";

        // Create uploads directory if it doesn't exist
        if (!Directory.Exists(_uploadsPath))
        {
            Directory.CreateDirectory(_uploadsPath);
            _logger.LogInformation("Created local uploads directory: {Path}", _uploadsPath);
        }

        _logger.LogInformation("Using local file storage at: {Path}", Path.GetFullPath(_uploadsPath));
    }

    public async Task<string> SaveFileAsync(Stream fileStream, string fileName, string contentType)
    {
        var filePath = Path.Combine(_uploadsPath, fileName);

        await using var fileStreamOutput = new FileStream(filePath, FileMode.Create, FileAccess.Write);
        await fileStream.CopyToAsync(fileStreamOutput);

        _logger.LogDebug("Saved file to local storage: {FileName}", fileName);
        return fileName;
    }

    public async Task<Stream> GetFileAsync(string fileName)
    {
        var filePath = Path.Combine(_uploadsPath, fileName);

        if (!File.Exists(filePath))
        {
            throw new FileNotFoundException($"File not found: {fileName}");
        }

        var memoryStream = new MemoryStream();
        await using var fileStream = new FileStream(filePath, FileMode.Open, FileAccess.Read);
        await fileStream.CopyToAsync(memoryStream);
        memoryStream.Position = 0;

        return memoryStream;
    }

    public Task<bool> DeleteFileAsync(string fileName)
    {
        var filePath = Path.Combine(_uploadsPath, fileName);

        if (File.Exists(filePath))
        {
            File.Delete(filePath);
            _logger.LogDebug("Deleted file from local storage: {FileName}", fileName);
            return Task.FromResult(true);
        }

        return Task.FromResult(false);
    }

    public Task<bool> FileExistsAsync(string fileName)
    {
        var filePath = Path.Combine(_uploadsPath, fileName);
        return Task.FromResult(File.Exists(filePath));
    }

    public string GetFileUrl(string fileName)
    {
        // For local development, return relative path
        // The API will serve these files directly
        return $"/uploads/{fileName}";
    }
}
