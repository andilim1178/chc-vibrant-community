using Microsoft.EntityFrameworkCore;
using PlaceRate.Api.Data;
using PlaceRate.Api.Models;

namespace PlaceRate.Api.Services;

public class ProjectService : IProjectService
{
    private readonly PlaceRateDbContext _context;

    public ProjectService(PlaceRateDbContext context)
    {
        _context = context;
    }

    public async Task<Project> CreateAsync(Project project)
    {
        var nameExists = await _context.Projects
            .AnyAsync(p => p.Name.ToLower() == project.Name.ToLower());

        if (nameExists)
        {
            throw new DuplicateProjectNameException(project.Name);
        }

        project.Id = Guid.NewGuid();
        project.CreatedAt = DateTime.UtcNow;
        project.UpdatedAt = DateTime.UtcNow;

        _context.Projects.Add(project);
        await _context.SaveChangesAsync();

        return project;
    }

    public async Task<IReadOnlyList<Project>> GetAllAsync()
    {
        return await _context.Projects
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

    public async Task<Project> GetByIdAsync(Guid id)
    {
        var project = await _context.Projects.FirstOrDefaultAsync(p => p.Id == id);
        if (project is null)
        {
            throw new ProjectNotFoundException(id);
        }
        return project;
    }

    public async Task<Project> UpdateAsync(Guid id, Project updated)
    {
        var existing = await _context.Projects.FirstOrDefaultAsync(p => p.Id == id);
        if (existing is null)
        {
            throw new ProjectNotFoundException(id);
        }

        var nameTakenByAnotherProject = await _context.Projects
            .AnyAsync(p => p.Id != id && p.Name.ToLower() == updated.Name.ToLower());
        if (nameTakenByAnotherProject)
        {
            throw new DuplicateProjectNameException(updated.Name);
        }

        existing.Name = updated.Name;
        existing.Addr = updated.Addr;
        existing.Postcode = updated.Postcode;
        existing.Type = updated.Type;
        existing.By = updated.By;
        existing.AnswersJson = updated.AnswersJson;
        existing.ScoresJson = updated.ScoresJson;
        existing.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return existing;
    }

    public async Task DeleteAsync(Guid id)
    {
        var existing = await _context.Projects.FirstOrDefaultAsync(p => p.Id == id);
        if (existing is null)
        {
            throw new ProjectNotFoundException(id);
        }

        _context.Projects.Remove(existing);
        await _context.SaveChangesAsync();
    }
}
