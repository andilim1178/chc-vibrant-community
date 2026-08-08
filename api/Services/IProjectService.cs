using PlaceRate.Api.Models;

namespace PlaceRate.Api.Services;

public interface IProjectService
{
    Task<Project> CreateAsync(Project project);
}
