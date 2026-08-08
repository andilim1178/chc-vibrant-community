# Projects Database + C# API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a C# Azure Functions API backed by an Azure SQL Database to persist projects, replacing the frontend's `localStorage`-only storage (frontend integration is a separate follow-up — this plan produces a backend that's fully tested standalone).

**Architecture:** An isolated-worker Azure Functions app (.NET 8) exposes CRUD HTTP endpoints under `/api/projects`, backed by EF Core against a single Azure SQL Database (serverless, auto-pause). Business logic (duplicate-name checks, CRUD) lives in a `ProjectService` class, unit-tested with EF Core's InMemory provider — the thin Functions layer just translates HTTP requests/responses. This matches the design in `docs/superpowers/specs/2026-08-08-projects-database-api-design.md`.

**Tech Stack:** .NET 8, Azure Functions (isolated worker), EF Core 8 (SqlServer + InMemory providers), xUnit, Azure SQL Database, Azure CLI.

## Global Constraints

- Target framework: `net8.0` for both the Functions project and the test project.
- Database: single Azure SQL Database (serverless, auto-pause) — same instance for local dev and production, per the design doc (no Docker/LocalDB available on this machine).
- Project IDs are server-generated GUIDs — never trust a client-supplied ID.
- `Project.Name` has a unique constraint at the database level, enforced additionally (and primarily, for a clean error message) in `ProjectService` before insert/rename.
- Answers/scores are stored as JSON string columns (`AnswersJson`, `ScoresJson`) — no relational normalization.
- Azure resources go in resource group `rg-vibrantcommunity`, region `australiaeast` (matching the existing Static Web App).
- **Any command that provisions or modifies billable Azure resources requires an explicit human go-ahead before running** — this is a real subscription, not a sandbox. Task 7 has a hard stop for this.
- `api/local.settings.json` is never committed (contains the real connection string) — must be gitignored before it's created.

---

### Task 1: Install local tooling

**Files:** None (local machine setup only, no repo changes).

**Interfaces:** Produces: a working `dotnet`, `func`, and `dotnet ef` CLI, required by every later task.

- [ ] **Step 1: Install the .NET SDK**

Run: `brew install dotnet-sdk`

- [ ] **Step 2: Verify the SDK includes .NET 8**

Run: `dotnet --list-sdks`
Expected: at least one line starting with `8.` (e.g. `8.0.404 [...]`). If none appear, run `brew install dotnet-sdk@8` and re-check.

- [ ] **Step 3: Install Azure Functions Core Tools v4**

Run:
```bash
brew tap azure/functions
brew install azure-functions-core-tools@4
```

- [ ] **Step 4: Verify Functions Core Tools**

Run: `func --version`
Expected: a `4.x.x` version string.

- [ ] **Step 5: Install the EF Core CLI tool**

Run: `dotnet tool install --global dotnet-ef`

- [ ] **Step 6: Verify the EF Core CLI tool**

Run: `dotnet ef --version`
Expected: a version string (e.g. `Entity Framework Core .NET Command-line Tools 8.x.x`).

No commit — this task only installs local tooling, no repository files change.

---

### Task 2: Scaffold the Functions project and test project

**Files:**
- Create: `PlaceRate.sln`
- Create: `api/PlaceRate.Api.csproj` (and template-generated `host.json`, `Program.cs`, `local.settings.json`)
- Create: `api/PlaceRate.Api.Tests/PlaceRate.Api.Tests.csproj` (and template-generated sample test)
- Modify: `.gitignore`

**Interfaces:** Produces: a buildable two-project solution (`PlaceRate.Api`, `PlaceRate.Api.Tests`) that later tasks add files into.

- [ ] **Step 1: Scaffold the Functions project**

Run (from the repo root):
```bash
dotnet new func --worker-runtime dotnet-isolated --target-framework net8.0 -n PlaceRate.Api -o api
```

- [ ] **Step 2: Scaffold the test project**

Run:
```bash
dotnet new xunit -n PlaceRate.Api.Tests -o api/PlaceRate.Api.Tests --target-framework net8.0
```

- [ ] **Step 3: Create the solution file and add both projects**

Run:
```bash
dotnet new sln -n PlaceRate
dotnet sln add api/PlaceRate.Api.csproj api/PlaceRate.Api.Tests/PlaceRate.Api.Tests.csproj
dotnet add api/PlaceRate.Api.Tests/PlaceRate.Api.Tests.csproj reference api/PlaceRate.Api.csproj
```

- [ ] **Step 4: Add EF Core packages**

Run:
```bash
dotnet add api/PlaceRate.Api.csproj package Microsoft.EntityFrameworkCore.SqlServer
dotnet add api/PlaceRate.Api.csproj package Microsoft.EntityFrameworkCore.Design
dotnet add api/PlaceRate.Api.Tests/PlaceRate.Api.Tests.csproj package Microsoft.EntityFrameworkCore.InMemory
```

- [ ] **Step 5: Gitignore the Functions build output and local secrets**

Append to `.gitignore` (create the file if it doesn't already have these — check first, don't duplicate lines that already exist):
```
api/**/bin/
api/**/obj/
api/local.settings.json
```

- [ ] **Step 6: Verify it builds**

Run: `dotnet build PlaceRate.sln`
Expected: `Build succeeded.` with 0 errors.

- [ ] **Step 7: Commit**

```bash
git add PlaceRate.sln api/ .gitignore
git commit -m "chore: scaffold PlaceRate.Api Azure Functions project and test project"
```

---

### Task 3: Project entity and EF Core DbContext (TDD)

**Files:**
- Create: `api/Models/Project.cs`
- Create: `api/Data/PlaceRateDbContext.cs`
- Create: `api/PlaceRate.Api.Tests/PlaceRateDbContextTests.cs`
- Delete: `api/PlaceRate.Api.Tests/UnitTest1.cs` (the scaffolded sample test)

**Interfaces:**
- Consumes: nothing new.
- Produces: `PlaceRate.Api.Models.Project` (properties: `Id: Guid`, `Name: string`, `Addr: string`, `Postcode: string?`, `Type: string`, `By: string?`, `ProjectDate: DateOnly`, `AnswersJson: string`, `ScoresJson: string`, `CreatedAt: DateTime`, `UpdatedAt: DateTime`) and `PlaceRate.Api.Data.PlaceRateDbContext` (constructor: `DbContextOptions<PlaceRateDbContext>`, exposes `DbSet<Project> Projects`) — every later task depends on both.

- [ ] **Step 1: Delete the scaffolded sample test**

```bash
git rm api/PlaceRate.Api.Tests/UnitTest1.cs
```

- [ ] **Step 2: Write the failing test**

Create `api/PlaceRate.Api.Tests/PlaceRateDbContextTests.cs`:
```csharp
using Microsoft.EntityFrameworkCore;
using PlaceRate.Api.Data;
using PlaceRate.Api.Models;
using Xunit;

namespace PlaceRate.Api.Tests;

public class PlaceRateDbContextTests
{
    private static PlaceRateDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<PlaceRateDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new PlaceRateDbContext(options);
    }

    [Fact]
    public async Task CanAddAndRetrieveProject()
    {
        using var context = CreateContext();
        var project = new Project
        {
            Id = Guid.NewGuid(),
            Name = "Test Project",
            Addr = "123 Main St",
            Type = "Mixed Use",
            ProjectDate = DateOnly.FromDateTime(DateTime.UtcNow),
            AnswersJson = "{}",
            ScoresJson = "{}",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        context.Projects.Add(project);
        await context.SaveChangesAsync();

        var retrieved = await context.Projects.FirstOrDefaultAsync(p => p.Id == project.Id);

        Assert.NotNull(retrieved);
        Assert.Equal("Test Project", retrieved!.Name);
    }
}
```

- [ ] **Step 3: Run the test to verify it fails to build**

Run: `dotnet test api/PlaceRate.Api.Tests/PlaceRate.Api.Tests.csproj`
Expected: build error — `PlaceRate.Api.Models` and `PlaceRate.Api.Data` namespaces don't exist yet.

- [ ] **Step 4: Implement the Project entity**

Create `api/Models/Project.cs`:
```csharp
namespace PlaceRate.Api.Models;

public class Project
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Addr { get; set; } = string.Empty;
    public string? Postcode { get; set; }
    public string Type { get; set; } = string.Empty;
    public string? By { get; set; }
    public DateOnly ProjectDate { get; set; }
    public string AnswersJson { get; set; } = "{}";
    public string ScoresJson { get; set; } = "{}";
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
```

- [ ] **Step 5: Implement the DbContext**

Create `api/Data/PlaceRateDbContext.cs`:
```csharp
using Microsoft.EntityFrameworkCore;
using PlaceRate.Api.Models;

namespace PlaceRate.Api.Data;

public class PlaceRateDbContext : DbContext
{
    public PlaceRateDbContext(DbContextOptions<PlaceRateDbContext> options) : base(options)
    {
    }

    public DbSet<Project> Projects => Set<Project>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Project>(entity =>
        {
            entity.HasKey(p => p.Id);
            entity.Property(p => p.Name).IsRequired().HasMaxLength(200);
            entity.HasIndex(p => p.Name).IsUnique();
            entity.Property(p => p.Addr).IsRequired().HasMaxLength(500);
            entity.Property(p => p.Postcode).HasMaxLength(20);
            entity.Property(p => p.Type).IsRequired().HasMaxLength(100);
            entity.Property(p => p.By).HasMaxLength(200);
            entity.Property(p => p.AnswersJson).IsRequired();
            entity.Property(p => p.ScoresJson).IsRequired();
        });
    }
}
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `dotnet test api/PlaceRate.Api.Tests/PlaceRate.Api.Tests.csproj`
Expected: `Passed! - Failed: 0, Passed: 1`

- [ ] **Step 7: Commit**

```bash
git add api/Models/Project.cs api/Data/PlaceRateDbContext.cs api/PlaceRate.Api.Tests/PlaceRateDbContextTests.cs
git commit -m "feat: add Project entity and EF Core DbContext"
```

---

### Task 4: ProjectService.CreateAsync with duplicate-name check (TDD)

**Files:**
- Create: `api/Services/IProjectService.cs`
- Create: `api/Services/ProjectService.cs`
- Create: `api/Services/DuplicateProjectNameException.cs`
- Create: `api/PlaceRate.Api.Tests/ProjectServiceTests.cs`
- Modify: `api/Program.cs`

**Interfaces:**
- Consumes: `PlaceRateDbContext`, `Project` (Task 3).
- Produces: `IProjectService.CreateAsync(Project project): Task<Project>`, `DuplicateProjectNameException(string name)` — both used by every later task that touches project creation. Also produces the pattern later tasks follow to extend `IProjectService`/`ProjectService` (Task 5 adds more methods to the same two files).

- [ ] **Step 1: Write the failing tests**

Create `api/PlaceRate.Api.Tests/ProjectServiceTests.cs`:
```csharp
using Microsoft.EntityFrameworkCore;
using PlaceRate.Api.Data;
using PlaceRate.Api.Models;
using PlaceRate.Api.Services;
using Xunit;

namespace PlaceRate.Api.Tests;

public class ProjectServiceTests
{
    private static PlaceRateDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<PlaceRateDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new PlaceRateDbContext(options);
    }

    private static Project NewProject(string name) => new()
    {
        Name = name,
        Addr = "81 Joseph Dr, Yalyalup WA 6280",
        Type = "Mixed Use",
        ProjectDate = DateOnly.FromDateTime(DateTime.UtcNow),
        AnswersJson = "{}",
        ScoresJson = "{}"
    };

    [Fact]
    public async Task CreateAsync_AssignsIdAndTimestamps()
    {
        using var context = CreateContext();
        var service = new ProjectService(context);

        var created = await service.CreateAsync(NewProject("Embark Town Centre"));

        Assert.NotEqual(Guid.Empty, created.Id);
        Assert.NotEqual(default, created.CreatedAt);
        Assert.Equal(created.CreatedAt, created.UpdatedAt);
    }

    [Fact]
    public async Task CreateAsync_ThrowsOnDuplicateName_CaseInsensitive()
    {
        using var context = CreateContext();
        var service = new ProjectService(context);

        await service.CreateAsync(NewProject("Embark Town Centre"));

        await Assert.ThrowsAsync<DuplicateProjectNameException>(
            () => service.CreateAsync(NewProject("embark town centre")));
    }
}
```

- [ ] **Step 2: Run the tests to verify they fail to build**

Run: `dotnet test api/PlaceRate.Api.Tests/PlaceRate.Api.Tests.csproj`
Expected: build error — `PlaceRate.Api.Services` namespace doesn't exist yet.

- [ ] **Step 3: Implement the exception type**

Create `api/Services/DuplicateProjectNameException.cs`:
```csharp
namespace PlaceRate.Api.Services;

public class DuplicateProjectNameException : Exception
{
    public DuplicateProjectNameException(string name)
        : base($"A project named '{name}' already exists.")
    {
    }
}
```

- [ ] **Step 4: Implement the service interface**

Create `api/Services/IProjectService.cs`:
```csharp
using PlaceRate.Api.Models;

namespace PlaceRate.Api.Services;

public interface IProjectService
{
    Task<Project> CreateAsync(Project project);
}
```

- [ ] **Step 5: Implement the service**

Create `api/Services/ProjectService.cs`:
```csharp
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
```

- [ ] **Step 6: Run the tests to verify they pass**

Run: `dotnet test api/PlaceRate.Api.Tests/PlaceRate.Api.Tests.csproj`
Expected: `Passed! - Failed: 0, Passed: 3`

- [ ] **Step 7: Wire the DbContext and service into the Functions host**

Replace the contents of `api/Program.cs` with:
```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using PlaceRate.Api.Data;
using PlaceRate.Api.Services;

var host = new HostBuilder()
    .ConfigureFunctionsWebApplication()
    .ConfigureServices((context, services) =>
    {
        var connectionString = context.Configuration["SqlConnectionString"]
            ?? throw new InvalidOperationException("SqlConnectionString is not configured.");

        services.AddDbContext<PlaceRateDbContext>(options =>
            options.UseSqlServer(connectionString));

        services.AddScoped<IProjectService, ProjectService>();
    })
    .Build();

host.Run();
```

- [ ] **Step 8: Verify the whole solution still builds**

Run: `dotnet build PlaceRate.sln`
Expected: `Build succeeded.` (this doesn't run the host, so the missing `SqlConnectionString` at runtime doesn't matter yet — it's only read when `func start` actually runs, starting in Task 9).

- [ ] **Step 9: Commit**

```bash
git add api/Services api/PlaceRate.Api.Tests/ProjectServiceTests.cs api/Program.cs
git commit -m "feat: add ProjectService.CreateAsync with duplicate-name check"
```

---

### Task 5: ProjectService read/update/delete (TDD)

**Files:**
- Modify: `api/Services/IProjectService.cs`
- Modify: `api/Services/ProjectService.cs`
- Create: `api/Services/ProjectNotFoundException.cs`
- Modify: `api/PlaceRate.Api.Tests/ProjectServiceTests.cs`

**Interfaces:**
- Consumes: `IProjectService`, `ProjectService`, `DuplicateProjectNameException`, `NewProject` test helper (Task 4).
- Produces: `IProjectService.GetAllAsync(): Task<IReadOnlyList<Project>>`, `GetByIdAsync(Guid id): Task<Project>`, `UpdateAsync(Guid id, Project updated): Task<Project>`, `DeleteAsync(Guid id): Task`, and `ProjectNotFoundException(Guid id)` — all consumed directly by the Functions handlers in Tasks 9–12.

- [ ] **Step 1: Write the failing tests**

Append to `api/PlaceRate.Api.Tests/ProjectServiceTests.cs` (inside the existing `ProjectServiceTests` class, after the two existing test methods):
```csharp
    [Fact]
    public async Task GetAllAsync_ReturnsAllCreatedProjects()
    {
        using var context = CreateContext();
        var service = new ProjectService(context);

        await service.CreateAsync(NewProject("Project A"));
        await service.CreateAsync(NewProject("Project B"));

        var all = await service.GetAllAsync();

        Assert.Equal(2, all.Count);
    }

    [Fact]
    public async Task GetByIdAsync_ThrowsWhenNotFound()
    {
        using var context = CreateContext();
        var service = new ProjectService(context);

        await Assert.ThrowsAsync<ProjectNotFoundException>(() => service.GetByIdAsync(Guid.NewGuid()));
    }

    [Fact]
    public async Task UpdateAsync_UpdatesFieldsAndTimestamp()
    {
        using var context = CreateContext();
        var service = new ProjectService(context);
        var created = await service.CreateAsync(NewProject("Original Name"));
        var originalUpdatedAt = created.UpdatedAt;

        var replacement = NewProject("Original Name");
        replacement.Addr = "New Address";
        var updated = await service.UpdateAsync(created.Id, replacement);

        Assert.Equal("New Address", updated.Addr);
        Assert.True(updated.UpdatedAt >= originalUpdatedAt);
    }

    [Fact]
    public async Task UpdateAsync_ThrowsWhenRenamingToAnotherProjectsName()
    {
        using var context = CreateContext();
        var service = new ProjectService(context);
        var first = await service.CreateAsync(NewProject("Project A"));
        await service.CreateAsync(NewProject("Project B"));

        await Assert.ThrowsAsync<DuplicateProjectNameException>(
            () => service.UpdateAsync(first.Id, NewProject("Project B")));
    }

    [Fact]
    public async Task DeleteAsync_RemovesProject()
    {
        using var context = CreateContext();
        var service = new ProjectService(context);
        var created = await service.CreateAsync(NewProject("To Delete"));

        await service.DeleteAsync(created.Id);

        await Assert.ThrowsAsync<ProjectNotFoundException>(() => service.GetByIdAsync(created.Id));
    }

    [Fact]
    public async Task DeleteAsync_ThrowsWhenNotFound()
    {
        using var context = CreateContext();
        var service = new ProjectService(context);

        await Assert.ThrowsAsync<ProjectNotFoundException>(() => service.DeleteAsync(Guid.NewGuid()));
    }
```

- [ ] **Step 2: Run the tests to verify they fail to build**

Run: `dotnet test api/PlaceRate.Api.Tests/PlaceRate.Api.Tests.csproj`
Expected: build error — `GetAllAsync`, `GetByIdAsync`, `UpdateAsync`, `DeleteAsync`, and `ProjectNotFoundException` don't exist yet.

- [ ] **Step 3: Implement the not-found exception**

Create `api/Services/ProjectNotFoundException.cs`:
```csharp
namespace PlaceRate.Api.Services;

public class ProjectNotFoundException : Exception
{
    public ProjectNotFoundException(Guid id)
        : base($"No project found with id '{id}'.")
    {
    }
}
```

- [ ] **Step 4: Extend the interface**

Replace `api/Services/IProjectService.cs` with:
```csharp
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
```

- [ ] **Step 5: Implement the new methods**

Add these methods inside the `ProjectService` class in `api/Services/ProjectService.cs` (after `CreateAsync`):
```csharp
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
```

- [ ] **Step 6: Run the tests to verify they pass**

Run: `dotnet test api/PlaceRate.Api.Tests/PlaceRate.Api.Tests.csproj`
Expected: `Passed! - Failed: 0, Passed: 9`

- [ ] **Step 7: Commit**

```bash
git add api/Services api/PlaceRate.Api.Tests/ProjectServiceTests.cs
git commit -m "feat: implement ProjectService read/update/delete operations"
```

---

### Task 6: DTOs and mapping extensions (TDD)

**Files:**
- Create: `api/Dtos/ProjectSummaryDto.cs`
- Create: `api/Dtos/ProjectDetailDto.cs`
- Create: `api/Dtos/CreateProjectRequest.cs`
- Create: `api/Dtos/UpdateProjectRequest.cs`
- Create: `api/Dtos/ProjectMappingExtensions.cs`
- Create: `api/PlaceRate.Api.Tests/ProjectMappingExtensionsTests.cs`

**Interfaces:**
- Consumes: `Project` (Task 3).
- Produces: `ProjectSummaryDto`, `ProjectDetailDto`, `CreateProjectRequest`, `UpdateProjectRequest` records, and extension methods `Project.ToSummaryDto()`, `Project.ToDetailDto()`, `CreateProjectRequest.ToProject()`, `UpdateProjectRequest.ToProject()` — all consumed directly by the Functions handlers in Tasks 9–12.

- [ ] **Step 1: Write the failing tests**

Create `api/PlaceRate.Api.Tests/ProjectMappingExtensionsTests.cs`:
```csharp
using PlaceRate.Api.Dtos;
using PlaceRate.Api.Models;
using Xunit;

namespace PlaceRate.Api.Tests;

public class ProjectMappingExtensionsTests
{
    private static Project SampleProject() => new()
    {
        Id = Guid.NewGuid(),
        Name = "Embark Town Centre",
        Addr = "81 Joseph Dr, Yalyalup WA 6280",
        Postcode = "6280",
        Type = "Mixed Use",
        By = "Jane Doe",
        ProjectDate = DateOnly.FromDateTime(DateTime.UtcNow),
        AnswersJson = "{\"transport\":{\"0\":\"yes\"}}",
        ScoresJson = "{\"transport\":5}",
        CreatedAt = DateTime.UtcNow,
        UpdatedAt = DateTime.UtcNow
    };

    [Fact]
    public void ToSummaryDto_CopiesCoreFields()
    {
        var project = SampleProject();
        var dto = project.ToSummaryDto();

        Assert.Equal(project.Id, dto.Id);
        Assert.Equal(project.Name, dto.Name);
        Assert.Equal(project.Addr, dto.Addr);
    }

    [Fact]
    public void ToDetailDto_IncludesAnswersAndScoresJson()
    {
        var project = SampleProject();
        var dto = project.ToDetailDto();

        Assert.Equal(project.AnswersJson, dto.AnswersJson);
        Assert.Equal(project.ScoresJson, dto.ScoresJson);
    }

    [Fact]
    public void CreateProjectRequest_ToProject_StartsWithEmptyAnswersAndScores()
    {
        var request = new CreateProjectRequest("New Project", "1 Main St", "6000", "Mixed Use", null);

        var project = request.ToProject();

        Assert.Equal("New Project", project.Name);
        Assert.Equal("{}", project.AnswersJson);
        Assert.Equal("{}", project.ScoresJson);
    }

    [Fact]
    public void UpdateProjectRequest_ToProject_CarriesSuppliedAnswersAndScores()
    {
        var request = new UpdateProjectRequest(
            "Renamed Project", "2 Main St", "6001", "Mixed Use", null,
            "{\"transport\":{\"0\":\"no\"}}", "{\"transport\":2}");

        var project = request.ToProject();

        Assert.Equal("{\"transport\":{\"0\":\"no\"}}", project.AnswersJson);
        Assert.Equal("{\"transport\":2}", project.ScoresJson);
    }
}
```

- [ ] **Step 2: Run the tests to verify they fail to build**

Run: `dotnet test api/PlaceRate.Api.Tests/PlaceRate.Api.Tests.csproj`
Expected: build error — `PlaceRate.Api.Dtos` namespace doesn't exist yet.

- [ ] **Step 3: Implement the DTOs**

Create `api/Dtos/ProjectSummaryDto.cs`:
```csharp
namespace PlaceRate.Api.Dtos;

public record ProjectSummaryDto(
    Guid Id,
    string Name,
    string Addr,
    string? Postcode,
    string Type,
    string? By,
    DateOnly ProjectDate,
    DateTime CreatedAt,
    DateTime UpdatedAt
);
```

Create `api/Dtos/ProjectDetailDto.cs`:
```csharp
namespace PlaceRate.Api.Dtos;

public record ProjectDetailDto(
    Guid Id,
    string Name,
    string Addr,
    string? Postcode,
    string Type,
    string? By,
    DateOnly ProjectDate,
    string AnswersJson,
    string ScoresJson,
    DateTime CreatedAt,
    DateTime UpdatedAt
);
```

Create `api/Dtos/CreateProjectRequest.cs`:
```csharp
namespace PlaceRate.Api.Dtos;

public record CreateProjectRequest(
    string Name,
    string Addr,
    string? Postcode,
    string Type,
    string? By
);
```

Create `api/Dtos/UpdateProjectRequest.cs`:
```csharp
namespace PlaceRate.Api.Dtos;

public record UpdateProjectRequest(
    string Name,
    string Addr,
    string? Postcode,
    string Type,
    string? By,
    string AnswersJson,
    string ScoresJson
);
```

- [ ] **Step 4: Implement the mapping extensions**

Create `api/Dtos/ProjectMappingExtensions.cs`:
```csharp
using PlaceRate.Api.Models;

namespace PlaceRate.Api.Dtos;

public static class ProjectMappingExtensions
{
    public static ProjectSummaryDto ToSummaryDto(this Project project) =>
        new(project.Id, project.Name, project.Addr, project.Postcode, project.Type,
            project.By, project.ProjectDate, project.CreatedAt, project.UpdatedAt);

    public static ProjectDetailDto ToDetailDto(this Project project) =>
        new(project.Id, project.Name, project.Addr, project.Postcode, project.Type,
            project.By, project.ProjectDate, project.AnswersJson, project.ScoresJson,
            project.CreatedAt, project.UpdatedAt);

    public static Project ToProject(this CreateProjectRequest request) => new()
    {
        Name = request.Name,
        Addr = request.Addr,
        Postcode = request.Postcode,
        Type = request.Type,
        By = request.By,
        ProjectDate = DateOnly.FromDateTime(DateTime.UtcNow),
        AnswersJson = "{}",
        ScoresJson = "{}"
    };

    public static Project ToProject(this UpdateProjectRequest request) => new()
    {
        Name = request.Name,
        Addr = request.Addr,
        Postcode = request.Postcode,
        Type = request.Type,
        By = request.By,
        AnswersJson = request.AnswersJson,
        ScoresJson = request.ScoresJson
    };
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `dotnet test api/PlaceRate.Api.Tests/PlaceRate.Api.Tests.csproj`
Expected: `Passed! - Failed: 0, Passed: 13`

- [ ] **Step 6: Commit**

```bash
git add api/Dtos api/PlaceRate.Api.Tests/ProjectMappingExtensionsTests.cs
git commit -m "feat: add project DTOs and mapping extensions"
```

---

### Task 7: Provision the Azure SQL Server and Database

**Files:** None (cloud resources only, no repository changes).

**Interfaces:** Produces: a live Azure SQL Database connection string, consumed by Task 8's `local.settings.json`.

> **STOP before Step 3.** This creates real, billable Azure resources on the CHC tenant subscription (not a sandbox). Confirm with the user first: resource group `rg-vibrantcommunity`, region `australiaeast`, SQL Server + Database named below, **General Purpose Serverless, Gen5, 1 vCore max, auto-pause after 60 minutes of inactivity** — cost is ~$0 while paused and small (roughly a few dollars/month) under light dev use. Do not run Steps 3–5 without an explicit go-ahead on these specifics.

- [ ] **Step 1: Confirm the subscription and resource group**

Run:
```bash
az account show --query "{name:name, id:id}"
az group show --name rg-vibrantcommunity --query "{name:name, location:location}"
```
Expected: subscription matches what was seen during design (`Azure subscription 1`, CHC tenant), and the resource group exists in `australiaeast`.

- [ ] **Step 2: Generate a secure admin password**

Run: `openssl rand -base64 24`
Save the output somewhere safe outside the repo (e.g. a password manager) — it goes into `api/local.settings.json` in Task 8, never into git.

- [ ] **Step 3 (STOP — get explicit go-ahead first): Create the SQL Server**

Run (replace `<generated-password>` with the value from Step 2):
```bash
az sql server create \
  --name sql-vibrantcommunity \
  --resource-group rg-vibrantcommunity \
  --location australiaeast \
  --admin-user placerateadmin \
  --admin-password '<generated-password>'
```

- [ ] **Step 4: Allow your local IP through the server firewall**

Run:
```bash
MY_IP=$(curl -s https://api.ipify.org)
az sql server firewall-rule create \
  --resource-group rg-vibrantcommunity \
  --server sql-vibrantcommunity \
  --name AllowLocalDev \
  --start-ip-address "$MY_IP" \
  --end-ip-address "$MY_IP"
```

- [ ] **Step 5: Create the serverless, auto-pausing database**

Run:
```bash
az sql db create \
  --resource-group rg-vibrantcommunity \
  --server sql-vibrantcommunity \
  --name PlaceRateDb \
  --edition GeneralPurpose \
  --family Gen5 \
  --capacity 1 \
  --compute-model Serverless \
  --auto-pause-delay 60
```

- [ ] **Step 6: Verify the database exists**

Run: `az sql db show --resource-group rg-vibrantcommunity --server sql-vibrantcommunity --name PlaceRateDb --query "{name:name, status:status}"`
Expected: `name` is `PlaceRateDb`, `status` is `Online` or `Paused` (both are fine — paused databases wake automatically on the first connection).

No commit — no repository files change (the connection string is used directly in Task 8).

---

### Task 8: EF Core migration and connect to the real database

**Files:**
- Create: `api/Data/PlaceRateDbContextFactory.cs`
- Create: `api/Migrations/*` (generated by `dotnet ef migrations add`)
- Modify: `api/local.settings.json` (gitignored — not committed)

**Interfaces:**
- Consumes: `PlaceRateDbContext` (Task 3), the connection string from Task 7.
- Produces: a `Projects` table in the real Azure SQL Database, matching the schema in Task 3's `OnModelCreating` — consumed by every Functions task from here on.

- [ ] **Step 1: Add a design-time factory so `dotnet ef` can build the context**

Create `api/Data/PlaceRateDbContextFactory.cs`:
```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace PlaceRate.Api.Data;

public class PlaceRateDbContextFactory : IDesignTimeDbContextFactory<PlaceRateDbContext>
{
    public PlaceRateDbContext CreateDbContext(string[] args)
    {
        var configuration = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("local.settings.json", optional: true)
            .AddEnvironmentVariables()
            .Build();

        var connectionString = configuration["Values:SqlConnectionString"]
            ?? configuration["SqlConnectionString"]
            ?? throw new InvalidOperationException("SqlConnectionString is not configured for migrations.");

        var optionsBuilder = new DbContextOptionsBuilder<PlaceRateDbContext>();
        optionsBuilder.UseSqlServer(connectionString);

        return new PlaceRateDbContext(optionsBuilder.Options);
    }
}
```

- [ ] **Step 2: Add the connection string to local settings**

Edit `api/local.settings.json` (created by the Task 2 scaffold) so its `Values` object includes the connection string from Task 7 (replace `<your-password>`):
```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "dotnet-isolated",
    "SqlConnectionString": "Server=tcp:sql-vibrantcommunity.database.windows.net,1433;Initial Catalog=PlaceRateDb;Persist Security Info=False;User ID=placerateadmin;Password=<your-password>;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"
  }
}
```

- [ ] **Step 3: Generate the migration**

Run: `dotnet ef migrations add InitialCreate --project api/PlaceRate.Api.csproj`
Expected: a new folder `api/Migrations/` containing `<timestamp>_InitialCreate.cs` and `PlaceRateDbContextModelSnapshot.cs`.

- [ ] **Step 4: Inspect the generated migration**

Open `api/Migrations/<timestamp>_InitialCreate.cs` and confirm the `Up()` method creates a `Projects` table and includes a unique index on `Name` (look for `IsUnique: true` on an index over the `Name` column).

- [ ] **Step 5: Apply the migration to the real database**

Run: `dotnet ef database update --project api/PlaceRate.Api.csproj`
Expected: output ending in `Done.`

- [ ] **Step 6: Verify the migration is applied**

Run: `dotnet ef migrations list --project api/PlaceRate.Api.csproj`
Expected: `InitialCreate` listed with no `(Pending)` marker.

- [ ] **Step 7: Commit (excluding the gitignored local settings)**

```bash
git add api/Data/PlaceRateDbContextFactory.cs api/Migrations
git status
```
Confirm `api/local.settings.json` does **not** appear in the output before committing (it should be gitignored from Task 2 — if it appears, stop and fix `.gitignore` first, don't commit it).

```bash
git commit -m "feat: add initial EF Core migration and design-time context factory"
```

---

### Task 9: GET list and GET-by-id endpoints

**Files:**
- Create: `api/Functions/ProjectsFunctions.cs`

**Interfaces:**
- Consumes: `IProjectService` (Task 5), `ToSummaryDto()`/`ToDetailDto()` (Task 6).
- Produces: `PlaceRate.Api.Functions.ProjectsFunctions` class — Tasks 10–12 add more `[Function(...)]` methods to this same class.

- [ ] **Step 1: Implement the two GET handlers**

Create `api/Functions/ProjectsFunctions.cs`:
```csharp
using System.Net;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
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
    public async Task<HttpResponseData> ListProjects(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "projects")] HttpRequestData req)
    {
        var projects = await _projectService.GetAllAsync();
        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(projects.Select(p => p.ToSummaryDto()));
        return response;
    }

    [Function("GetProject")]
    public async Task<HttpResponseData> GetProject(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "projects/{id:guid}")] HttpRequestData req,
        Guid id)
    {
        try
        {
            var project = await _projectService.GetByIdAsync(id);
            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(project.ToDetailDto());
            return response;
        }
        catch (ProjectNotFoundException ex)
        {
            _logger.LogWarning("GetProject: {Message}", ex.Message);
            var response = req.CreateResponse(HttpStatusCode.NotFound);
            await response.WriteAsJsonAsync(new { error = ex.Message });
            return response;
        }
    }
}
```

- [ ] **Step 2: Verify the solution builds**

Run: `dotnet build PlaceRate.sln`
Expected: `Build succeeded.`

- [ ] **Step 3: Start the Functions host**

Run (from the `api/` directory): `func start`
Expected: output listing `ListProjects: [GET] http://localhost:7071/api/projects` and `GetProject: [GET] http://localhost:7071/api/projects/{id}`. Leave this running for the curl checks below (use another terminal tab).

- [ ] **Step 4: Verify the list endpoint on an empty database**

Run: `curl -s http://localhost:7071/api/projects`
Expected: `[]`

- [ ] **Step 5: Verify the not-found case**

Run: `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:7071/api/projects/00000000-0000-0000-0000-000000000000`
Expected: `404`

- [ ] **Step 6: Commit**

```bash
git add api/Functions/ProjectsFunctions.cs
git commit -m "feat: add GET list and GET detail project endpoints"
```

---

### Task 10: POST create endpoint

**Files:**
- Modify: `api/Functions/ProjectsFunctions.cs`

**Interfaces:**
- Consumes: `CreateProjectRequest`, `ToProject()` (Task 6), `IProjectService.CreateAsync` (Task 4).
- Produces: `[Function("CreateProject")]` handler — Task 13's smoke test relies on this endpoint's response shape (`id` field present in the JSON body).

- [ ] **Step 1: Implement the POST handler**

Add this method inside the `ProjectsFunctions` class (after `GetProject`):
```csharp
    [Function("CreateProject")]
    public async Task<HttpResponseData> CreateProject(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "projects")] HttpRequestData req)
    {
        var request = await req.ReadFromJsonAsync<CreateProjectRequest>();
        if (request is null || string.IsNullOrWhiteSpace(request.Name))
        {
            var badRequest = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequest.WriteAsJsonAsync(new { error = "Name is required." });
            return badRequest;
        }

        try
        {
            var created = await _projectService.CreateAsync(request.ToProject());
            var response = req.CreateResponse(HttpStatusCode.Created);
            await response.WriteAsJsonAsync(created.ToDetailDto());
            return response;
        }
        catch (DuplicateProjectNameException ex)
        {
            _logger.LogWarning("CreateProject: {Message}", ex.Message);
            var conflict = req.CreateResponse(HttpStatusCode.Conflict);
            await conflict.WriteAsJsonAsync(new { error = ex.Message });
            return conflict;
        }
    }
```

- [ ] **Step 2: Restart the Functions host**

Stop the running `func start` (Ctrl+C) and run it again from `api/` so it picks up the new handler.

- [ ] **Step 3: Verify project creation**

Run:
```bash
curl -s -X POST http://localhost:7071/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name":"Embark Town Centre","addr":"81 Joseph Dr, Yalyalup WA 6280","postcode":"6280","type":"Mixed Use","by":null}'
```
Expected: `201`-style JSON body including a generated `id` field and `"answersJson":"{}"`.

- [ ] **Step 4: Verify the duplicate-name conflict**

Run the same command again with a different `addr` but the same `name`:
```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:7071/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name":"Embark Town Centre","addr":"Different address","postcode":"6000","type":"Mixed Use","by":null}'
```
Expected: `409`

- [ ] **Step 5: Commit**

```bash
git add api/Functions/ProjectsFunctions.cs
git commit -m "feat: add POST create project endpoint with duplicate-name conflict"
```

---

### Task 11: PUT update endpoint

**Files:**
- Modify: `api/Functions/ProjectsFunctions.cs`

**Interfaces:**
- Consumes: `UpdateProjectRequest`, `ToProject()` (Task 6), `IProjectService.UpdateAsync` (Task 5).
- Produces: `[Function("UpdateProject")]` handler — Task 13's smoke test relies on this to change `answersJson`/`scoresJson`.

- [ ] **Step 1: Implement the PUT handler**

Add this method inside the `ProjectsFunctions` class (after `CreateProject`):
```csharp
    [Function("UpdateProject")]
    public async Task<HttpResponseData> UpdateProject(
        [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "projects/{id:guid}")] HttpRequestData req,
        Guid id)
    {
        var request = await req.ReadFromJsonAsync<UpdateProjectRequest>();
        if (request is null || string.IsNullOrWhiteSpace(request.Name))
        {
            var badRequest = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequest.WriteAsJsonAsync(new { error = "Name is required." });
            return badRequest;
        }

        try
        {
            var updated = await _projectService.UpdateAsync(id, request.ToProject());
            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(updated.ToDetailDto());
            return response;
        }
        catch (ProjectNotFoundException ex)
        {
            _logger.LogWarning("UpdateProject: {Message}", ex.Message);
            var notFound = req.CreateResponse(HttpStatusCode.NotFound);
            await notFound.WriteAsJsonAsync(new { error = ex.Message });
            return notFound;
        }
        catch (DuplicateProjectNameException ex)
        {
            _logger.LogWarning("UpdateProject: {Message}", ex.Message);
            var conflict = req.CreateResponse(HttpStatusCode.Conflict);
            await conflict.WriteAsJsonAsync(new { error = ex.Message });
            return conflict;
        }
    }
```

- [ ] **Step 2: Restart the Functions host**

Stop and re-run `func start` from `api/`.

- [ ] **Step 3: Verify updating an existing project**

Using the `id` returned from Task 10's create call (call `curl -s http://localhost:7071/api/projects` to find it if needed):
```bash
curl -s -X PUT http://localhost:7071/api/projects/<id> \
  -H "Content-Type: application/json" \
  -d '{"name":"Embark Town Centre","addr":"81 Joseph Dr, Yalyalup WA 6280","postcode":"6280","type":"Mixed Use","by":null,"answersJson":"{\"transport\":{\"0\":\"yes\"}}","scoresJson":"{\"transport\":5}"}'
```
Expected: `200`-style JSON body with `"answersJson":"{\"transport\":{\"0\":\"yes\"}}"`.

- [ ] **Step 4: Verify the not-found case**

Run:
```bash
curl -s -o /dev/null -w "%{http_code}\n" -X PUT http://localhost:7071/api/projects/00000000-0000-0000-0000-000000000000 \
  -H "Content-Type: application/json" \
  -d '{"name":"X","addr":"Y","postcode":null,"type":"Z","by":null,"answersJson":"{}","scoresJson":"{}"}'
```
Expected: `404`

- [ ] **Step 5: Commit**

```bash
git add api/Functions/ProjectsFunctions.cs
git commit -m "feat: add PUT update project endpoint"
```

---

### Task 12: DELETE endpoint

**Files:**
- Modify: `api/Functions/ProjectsFunctions.cs`

**Interfaces:**
- Consumes: `IProjectService.DeleteAsync` (Task 5).
- Produces: `[Function("DeleteProject")]` handler — Task 13's smoke test relies on this returning `204`.

- [ ] **Step 1: Implement the DELETE handler**

Add this method inside the `ProjectsFunctions` class (after `UpdateProject`):
```csharp
    [Function("DeleteProject")]
    public async Task<HttpResponseData> DeleteProject(
        [HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = "projects/{id:guid}")] HttpRequestData req,
        Guid id)
    {
        try
        {
            await _projectService.DeleteAsync(id);
            return req.CreateResponse(HttpStatusCode.NoContent);
        }
        catch (ProjectNotFoundException ex)
        {
            _logger.LogWarning("DeleteProject: {Message}", ex.Message);
            var notFound = req.CreateResponse(HttpStatusCode.NotFound);
            await notFound.WriteAsJsonAsync(new { error = ex.Message });
            return notFound;
        }
    }
```

- [ ] **Step 2: Restart the Functions host**

Stop and re-run `func start` from `api/`.

- [ ] **Step 3: Verify deletion**

Using the same `id` from Task 11:
```bash
curl -s -o /dev/null -w "%{http_code}\n" -X DELETE http://localhost:7071/api/projects/<id>
```
Expected: `204`

- [ ] **Step 4: Verify it's actually gone**

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:7071/api/projects/<id>
```
Expected: `404`

- [ ] **Step 5: Commit**

```bash
git add api/Functions/ProjectsFunctions.cs
git commit -m "feat: add DELETE project endpoint"
```

---

### Task 13: End-to-end smoke test script

**Files:**
- Create: `api/scripts/smoke-test.sh`

**Interfaces:** Consumes: all five endpoints (Tasks 9–12) exactly as they behave with `func start` running locally against the real database. Produces: a repeatable regression script for this whole plan's success criteria.

- [ ] **Step 1: Write the smoke test script**

Create `api/scripts/smoke-test.sh`:
```bash
#!/usr/bin/env bash
set -euo pipefail

BASE_URL="http://localhost:7071/api/projects"

echo "1. Create project"
CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{"name":"Smoke Test Project","addr":"1 Test St","postcode":"6000","type":"Mixed Use","by":null}')
echo "$CREATE_RESPONSE"
ID=$(echo "$CREATE_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Created id: $ID"

echo "2. List projects"
curl -s "$BASE_URL" | grep -q "$ID" && echo "PASS: appears in list" || { echo "FAIL: not in list"; exit 1; }

echo "3. Get by id"
curl -s "$BASE_URL/$ID" | grep -q '"answersJson":"{}"' && echo "PASS: empty answers" || { echo "FAIL"; exit 1; }

echo "4. Update project"
curl -s -X PUT "$BASE_URL/$ID" \
  -H "Content-Type: application/json" \
  -d '{"name":"Smoke Test Project","addr":"1 Test St","postcode":"6000","type":"Mixed Use","by":null,"answersJson":"{\"transport\":{\"0\":\"yes\"}}","scoresJson":"{\"transport\":5}"}' \
  | grep -q 'transport' && echo "PASS: update reflected" || { echo "FAIL"; exit 1; }

echo "5. Duplicate name conflict"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{"name":"Smoke Test Project","addr":"Different","postcode":"6000","type":"Mixed Use","by":null}')
[ "$STATUS" = "409" ] && echo "PASS: 409 on duplicate" || { echo "FAIL: got $STATUS"; exit 1; }

echo "6. Delete project"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE_URL/$ID")
[ "$STATUS" = "204" ] && echo "PASS: 204 on delete" || { echo "FAIL: got $STATUS"; exit 1; }

echo "7. Confirm deleted"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/$ID")
[ "$STATUS" = "404" ] && echo "PASS: 404 after delete" || { echo "FAIL: got $STATUS"; exit 1; }

echo "ALL SMOKE TESTS PASSED"
```

- [ ] **Step 2: Make it executable**

Run: `chmod +x api/scripts/smoke-test.sh`

- [ ] **Step 3: Run it against the local Functions host**

With `func start` running from `api/` in another terminal:
```bash
./api/scripts/smoke-test.sh
```
Expected: all seven steps print `PASS`, ending with `ALL SMOKE TESTS PASSED`.

- [ ] **Step 4: Commit**

```bash
git add api/scripts/smoke-test.sh
git commit -m "test: add end-to-end smoke test script for the projects API"
```
