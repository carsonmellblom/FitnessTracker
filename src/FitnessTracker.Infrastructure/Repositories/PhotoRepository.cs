using FitnessTracker.Core.Entities;
using FitnessTracker.Core.Interfaces;
using FitnessTracker.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FitnessTracker.Infrastructure.Repositories;

public class PhotoRepository : IPhotoRepository
{
    private readonly FitnessDbContext _context;

    public PhotoRepository(FitnessDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ProgressPhoto>> GetAllAsync(string userId)
    {
        return await _context.ProgressPhotos
            .Where(p => p.UserId == userId)
            .OrderByDescending(p => p.UploadedAt)
            .ToListAsync();
    }

    public async Task<ProgressPhoto?> GetByIdAsync(int id)
    {
        return await _context.ProgressPhotos.FindAsync(id);
    }

    public async Task<ProgressPhoto> CreateAsync(ProgressPhoto photo)
    {
        _context.ProgressPhotos.Add(photo);
        await _context.SaveChangesAsync();
        return photo;
    }

    public async Task<ProgressPhoto> UpdateAsync(ProgressPhoto photo)
    {
        _context.ProgressPhotos.Update(photo);
        await _context.SaveChangesAsync();
        return photo;
    }

    public async Task DeleteAsync(int id)
    {
        var photo = await _context.ProgressPhotos.FindAsync(id);
        if (photo != null)
        {
            _context.ProgressPhotos.Remove(photo);
            await _context.SaveChangesAsync();
        }
    }
}
