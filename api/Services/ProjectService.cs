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
}
