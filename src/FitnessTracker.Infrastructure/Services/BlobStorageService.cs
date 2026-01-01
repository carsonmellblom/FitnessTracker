using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Azure.Storage.Sas;
using FitnessTracker.Core.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace FitnessTracker.Infrastructure.Services;

/// <summary>
/// Azure Blob Storage implementation for production
/// </summary>
public class BlobStorageService : IFileStorageService
{
    private readonly BlobContainerClient _containerClient;
    private readonly ILogger<BlobStorageService> _logger;
    private readonly string _containerName;

    public BlobStorageService(IConfiguration configuration, ILogger<BlobStorageService> _logger)
    {
        this._logger = _logger;

        var connectionString = configuration["AzureStorage:ConnectionString"]
            ?? throw new InvalidOperationException("AzureStorage:ConnectionString is required for BlobStorageService");

        _containerName = configuration["AzureStorage:ContainerName"] ?? "progress-photos";

        var blobServiceClient = new BlobServiceClient(connectionString);
        _containerClient = blobServiceClient.GetBlobContainerClient(_containerName);

        // Create container if it doesn't exist
        _containerClient.CreateIfNotExists(PublicAccessType.None);

        _logger.LogInformation("Using Azure Blob Storage: Container '{ContainerName}'", _containerName);
    }

    public async Task<string> SaveFileAsync(Stream fileStream, string fileName, string contentType)
    {
        var blobClient = _containerClient.GetBlobClient(fileName);

        var blobHttpHeaders = new BlobHttpHeaders
        {
            ContentType = contentType
        };

        await blobClient.UploadAsync(fileStream, new BlobUploadOptions
        {
            HttpHeaders = blobHttpHeaders
        });

        _logger.LogDebug("Uploaded file to blob storage: {FileName}", fileName);
        return fileName;
    }

    public async Task<Stream> GetFileAsync(string fileName)
    {
        var blobClient = _containerClient.GetBlobClient(fileName);

        if (!await blobClient.ExistsAsync())
        {
            throw new FileNotFoundException($"Blob not found: {fileName}");
        }

        var memoryStream = new MemoryStream();
        await blobClient.DownloadToAsync(memoryStream);
        memoryStream.Position = 0;

        return memoryStream;
    }

    public async Task<bool> DeleteFileAsync(string fileName)
    {
        var blobClient = _containerClient.GetBlobClient(fileName);
        var result = await blobClient.DeleteIfExistsAsync();

        if (result.Value)
        {
            _logger.LogDebug("Deleted file from blob storage: {FileName}", fileName);
        }

        return result.Value;
    }

    public async Task<bool> FileExistsAsync(string fileName)
    {
        var blobClient = _containerClient.GetBlobClient(fileName);
        return await blobClient.ExistsAsync();
    }

    public string GetFileUrl(string fileName)
    {
        var blobClient = _containerClient.GetBlobClient(fileName);

        // Generate SAS URL with 15-minute read access
        if (blobClient.CanGenerateSasUri)
        {
            var sasBuilder = new BlobSasBuilder
            {
                BlobContainerName = _containerName,
                BlobName = fileName,
                Resource = "b", // blob
                ExpiresOn = DateTimeOffset.UtcNow.AddMinutes(15)
            };
            sasBuilder.SetPermissions(BlobSasPermissions.Read);

            var sasUri = blobClient.GenerateSasUri(sasBuilder);
            return sasUri.ToString();
        }

        // Fallback to blob URL (only works if container is public, which it isn't)
        return blobClient.Uri.ToString();
    }
}
