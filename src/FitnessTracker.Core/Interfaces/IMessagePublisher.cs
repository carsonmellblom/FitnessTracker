namespace FitnessTracker.Core.Interfaces;

public interface IMessagePublisher
{
    Task PublishPhotoForProcessingAsync(int photoId, string imagePath);
}
