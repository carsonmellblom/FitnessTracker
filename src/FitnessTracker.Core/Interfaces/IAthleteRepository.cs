using FitnessTracker.Core.Entities;

namespace FitnessTracker.Core.Interfaces;

public interface IAthleteRepository
{
    Task<IEnumerable<Athlete>> GetAllAsync();
    Task<Athlete?> GetByIdAsync(int id);
    Task<Athlete?> GetByEmailAsync(string email);
    Task<Athlete> CreateAsync(Athlete athlete);
    Task<Athlete> UpdateAsync(Athlete athlete);
    Task DeleteAsync(int id);
}
