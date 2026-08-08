using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using PlaceRate.Api.Dtos;
using PlaceRate.Api.Services;

namespace PlaceRate.Api.Functions;

public class ProjectsFunctions
{
    private readonly IProjectService _projectService;
    private readonly ILogger<ProjectsFunctions> _logger;

    public ProjectsFunctions(IProjectService projectService, ILogger<ProjectsFunctions> logger)
    {
        _projectService = projectService;
        _logger = logger;
    }

    [Function("ListProjects")]
    public async Task<IActionResult> ListProjects(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "projects")] HttpRequest req)
    {
        var projects = await _projectService.GetAllAsync();
        return new OkObjectResult(projects.Select(p => p.ToSummaryDto()));
    }

    [Function("GetProject")]
    public async Task<IActionResult> GetProject(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "projects/{id:guid}")] HttpRequest req,
        Guid id)
    {
        try
        {
            var project = await _projectService.GetByIdAsync(id);
            return new OkObjectResult(project.ToDetailDto());
        }
        catch (ProjectNotFoundException ex)
        {
            _logger.LogWarning("GetProject: {Message}", ex.Message);
            return new NotFoundObjectResult(new { error = ex.Message });
        }
    }

    [Function("CreateProject")]
    public async Task<IActionResult> CreateProject(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "projects")] HttpRequest req)
    {
        var request = await req.ReadFromJsonAsync<CreateProjectRequest>();
        if (request is null || string.IsNullOrWhiteSpace(request.Name))
        {
            return new BadRequestObjectResult(new { error = "Name is required." });
        }

        try
        {
            var created = await _projectService.CreateAsync(request.ToProject());
            return new CreatedResult($"/api/projects/{created.Id}", created.ToDetailDto());
        }
        catch (DuplicateProjectNameException ex)
        {
            _logger.LogWarning("CreateProject: {Message}", ex.Message);
            return new ConflictObjectResult(new { error = ex.Message });
        }
    }
}
