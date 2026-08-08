using PlaceRate.Api.Models;

namespace PlaceRate.Api.Services;

public interface IProjectService
{
    Task<Project> CreateAsync(Project project);
    Task<IReadOnlyList<Project>> GetAllAsync();
    Task<Project> GetByIdAsync(Guid id);
    Task<Project> UpdateAsync(Guid id, Project updated);
    Task DeleteAsync(Guid id);
}
