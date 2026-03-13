using BetterLink.Backend.Models.DTOs.Auth;
using BetterLink.Backend.Tests.Helpers;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;

namespace BetterLink.Backend.Tests.Tests;

public class JobsTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;

    public JobsTests(TestWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private async Task<string> GetEmployerTokenAsync()
    {
        var email = $"emp-jobs-{Guid.NewGuid()}@test.com";
        var response = await _client.PostAsJsonAsync("/api/auth/register/employer", new
        {
            email,
            password = "Test1234!",
            fullName = "Jobs Employer",
            organizationName = "Jobs Corp"
        });
        var auth = await response.Content.ReadFromJsonAsync<AuthResponse>();
        return auth!.Token;
    }

    private async Task<string> GetStudentTokenAsync()
    {
        var email = $"stu-jobs-{Guid.NewGuid()}@test.com";
        var response = await _client.PostAsJsonAsync("/api/auth/register/student", new
        {
            email,
            password = "Test1234!",
            fullName = "Jobs Student",
            university = "NCU",
            programName = "CS"
        });
        var auth = await response.Content.ReadFromJsonAsync<AuthResponse>();
        return auth!.Token;
    }

    private async Task<long> CreateOpenJobAsEmployerAsync()
    {
        var employerToken = await GetEmployerTokenAsync();
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", employerToken);

        var createResponse = await _client.PostAsJsonAsync("/api/jobs", new
        {
            title = $"Role {Guid.NewGuid()}",
            description = "Role used for apply-to-job testing.",
            employmentType = "full-time"
        });

        _client.DefaultRequestHeaders.Authorization = null;
        createResponse.EnsureSuccessStatusCode();

        var created = await createResponse.Content.ReadFromJsonAsync<JsonElement>();
        return created.GetProperty("id").GetInt64();
    }

    // ─── GET /api/jobs ────────────────────────────────────────────────────────

    [Fact]
    public async Task GetJobs_NoAuth_Returns200()
    {
        var response = await _client.GetAsync("/api/jobs");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GetJobs_AfterPosting_ReturnsPostedJob()
    {
        var token = await GetEmployerTokenAsync();
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        // Post a job
        var createResponse = await _client.PostAsJsonAsync("/api/jobs", new
        {
            title = "Backend Developer",
            description = "Build APIs with ASP.NET Core.",
            location = "Kingston",
            employmentType = "full-time"
        });
        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);

        // Clear auth so we verify it's publicly accessible
        _client.DefaultRequestHeaders.Authorization = null;

        var listResponse = await _client.GetAsync("/api/jobs");
        Assert.Equal(HttpStatusCode.OK, listResponse.StatusCode);

        var jobs = await listResponse.Content.ReadFromJsonAsync<JsonElement[]>();
        Assert.NotNull(jobs);
        Assert.True(jobs.Length > 0);
    }

    // ─── POST /api/jobs ───────────────────────────────────────────────────────

    [Fact]
    public async Task CreateJob_AsEmployer_Returns201()
    {
        var token = await GetEmployerTokenAsync();
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        var response = await _client.PostAsJsonAsync("/api/jobs", new
        {
            title = $"Dev Role {Guid.NewGuid()}",
            description = "Some description.",
            employmentType = "internship"
        });

        _client.DefaultRequestHeaders.Authorization = null;
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Fact]
    public async Task CreateJob_AsStudent_Returns403()
    {
        var token = await GetStudentTokenAsync();
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        var response = await _client.PostAsJsonAsync("/api/jobs", new
        {
            title = "Unauthorized Job",
            description = "Students cannot post jobs.",
            employmentType = "full-time"
        });

        _client.DefaultRequestHeaders.Authorization = null;
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task CreateJob_Unauthenticated_Returns401()
    {
        var response = await _client.PostAsJsonAsync("/api/jobs", new
        {
            title = "No Auth Job",
            description = "Should be rejected.",
            employmentType = "full-time"
        });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    // ─── GET /api/jobs/{id} ───────────────────────────────────────────────────

    [Fact]
    public async Task GetJobById_ExistingJob_Returns200()
    {
        var token = await GetEmployerTokenAsync();
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        // Create a job and capture its ID
        var createResponse = await _client.PostAsJsonAsync("/api/jobs", new
        {
            title = "Senior Dev",
            description = "Lead the backend engineering.",
            employmentType = "full-time"
        });
        var created = await createResponse.Content.ReadFromJsonAsync<JsonElement>();
        var id = created.GetProperty("id").GetInt64();

        _client.DefaultRequestHeaders.Authorization = null;

        var getResponse = await _client.GetAsync($"/api/jobs/{id}");
        Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);

        var job = await getResponse.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal("Senior Dev", job.GetProperty("title").GetString());
    }

    [Fact]
    public async Task GetJobById_NonExistentId_Returns404()
    {
        var response = await _client.GetAsync("/api/jobs/999999");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    // ─── POST /api/jobs/{id}/apply ───────────────────────────────────────────

    [Fact]
    public async Task ApplyToJob_AsStudent_Returns200()
    {
        var jobId = await CreateOpenJobAsEmployerAsync();
        var studentToken = await GetStudentTokenAsync();

        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", studentToken);

        var response = await _client.PostAsJsonAsync($"/api/jobs/{jobId}/apply", new
        {
            coverLetter = "I am very interested in this role."
        });

        _client.DefaultRequestHeaders.Authorization = null;
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task ApplyToJob_DuplicateStudentApplication_Returns409()
    {
        var jobId = await CreateOpenJobAsEmployerAsync();
        var studentToken = await GetStudentTokenAsync();

        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", studentToken);

        await _client.PostAsJsonAsync($"/api/jobs/{jobId}/apply", new
        {
            coverLetter = "First application"
        });

        var duplicate = await _client.PostAsJsonAsync($"/api/jobs/{jobId}/apply", new
        {
            coverLetter = "Second application"
        });

        _client.DefaultRequestHeaders.Authorization = null;
        Assert.Equal(HttpStatusCode.Conflict, duplicate.StatusCode);
    }

    [Fact]
    public async Task ApplyToJob_AsEmployer_Returns403()
    {
        var jobId = await CreateOpenJobAsEmployerAsync();
        var employerToken = await GetEmployerTokenAsync();

        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", employerToken);

        var response = await _client.PostAsJsonAsync($"/api/jobs/{jobId}/apply", new
        {
            coverLetter = "Employers cannot apply"
        });

        _client.DefaultRequestHeaders.Authorization = null;
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task ApplyToJob_Unauthenticated_Returns401()
    {
        var jobId = await CreateOpenJobAsEmployerAsync();

        var response = await _client.PostAsJsonAsync($"/api/jobs/{jobId}/apply", new
        {
            coverLetter = "No auth"
        });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
