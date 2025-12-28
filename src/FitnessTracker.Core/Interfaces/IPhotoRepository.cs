using FitnessTracker.Core.Entities;

namespace FitnessTracker.Core.Interfaces;

public interface IPhotoRepository
{
    Task<IEnumerable<ProgressPhoto>> GetAllAsync(string userId);
    Task<ProgressPhoto?> GetByIdAsync(int id);
    Task<ProgressPhoto> CreateAsync(ProgressPhoto photo);
    Task<ProgressPhoto> UpdateAsync(ProgressPhoto photo);
    Task DeleteAsync(int id);
}
