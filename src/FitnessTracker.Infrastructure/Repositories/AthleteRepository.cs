using FitnessTracker.Core.Entities;
using FitnessTracker.Core.Interfaces;
using FitnessTracker.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FitnessTracker.Infrastructure.Repositories;

public class AthleteRepository : IAthleteRepository
{
    private readonly FitnessDbContext _context;

    public AthleteRepository(FitnessDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Athlete>> GetAllAsync()
    {
        return await _context.Athletes.ToListAsync();
    }

    public async Task<Athlete?> GetByIdAsync(int id)
    {
        return await _context.Athletes
            .Include(a => a.Workouts)
            .Include(a => a.ProgressPhotos)
            .FirstOrDefaultAsync(a => a.Id == id);
    }

    public async Task<Athlete?> GetByEmailAsync(string email)
    {
        return await _context.Athletes.FirstOrDefaultAsync(a => a.Email == email);
    }

    public async Task<Athlete> CreateAsync(Athlete athlete)
    {
        _context.Athletes.Add(athlete);
        await _context.SaveChangesAsync();
        return athlete;
    }

    public async Task<Athlete> UpdateAsync(Athlete athlete)
    {
        _context.Athletes.Update(athlete);
        await _context.SaveChangesAsync();
        return athlete;
    }

    public async Task DeleteAsync(int id)
    {
        var athlete = await _context.Athletes.FindAsync(id);
        if (athlete != null)
        {
            _context.Athletes.Remove(athlete);
            await _context.SaveChangesAsync();
        }
    }
}
