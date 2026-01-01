namespace FitnessTracker.Core.Interfaces;

/// <summary>
/// Interface for file storage operations
/// Implementations: LocalFileStorageService (development), BlobStorageService (production)
/// </summary>
public interface IFileStorageService
{
    /// <summary>
    /// Saves a file to storage
    /// </summary>
    /// <param name="fileStream">The file content stream</param>
    /// <param name="fileName">The filename to save as</param>
    /// <param name="contentType">MIME type of the file</param>
    /// <returns>The storage path/identifier of the saved file</returns>
    Task<string> SaveFileAsync(Stream fileStream, string fileName, string contentType);

    /// <summary>
    /// Retrieves a file from storage
    /// </summary>
    /// <param name="fileName">The filename to retrieve</param>
    /// <returns>Stream containing the file content</returns>
    Task<Stream> GetFileAsync(string fileName);

    /// <summary>
    /// Deletes a file from storage
    /// </summary>
    /// <param name="fileName">The filename to delete</param>
    /// <returns>True if deleted successfully, false if file doesn't exist</returns>
    Task<bool> DeleteFileAsync(string fileName);

    /// <summary>
    /// Checks if a file exists in storage
    /// </summary>
    /// <param name="fileName">The filename to check</param>
    /// <returns>True if file exists</returns>
    Task<bool> FileExistsAsync(string fileName);

    /// <summary>
    /// Gets a publicly accessible URL for a file
    /// </summary>
    /// <param name="fileName">The filename</param>
    /// <returns>URL to access the file</returns>
    string GetFileUrl(string fileName);
}
