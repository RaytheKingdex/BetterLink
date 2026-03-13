using BetterLink.Backend.Models.DTOs.Auth;
using BetterLink.Backend.Tests.Helpers;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;

namespace BetterLink.Backend.Tests.Tests;

public class ApplicationsTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;

    public ApplicationsTests(TestWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    private async Task<string> RegisterEmployerAndGetTokenAsync()
    {
        var email = $"employer-app-{Guid.NewGuid()}@test.com";
        var response = await _client.PostAsJsonAsync("/api/auth/register/employer", new
        {
            email,
            password = "Test1234!",
            fullName = "Employer Applications",
            organizationName = "Applications Corp"
        });

        var auth = await response.Content.ReadFromJsonAsync<AuthResponse>();
        return auth!.Token;
    }

    private async Task<string> RegisterStudentAndGetTokenAsync()
    {
        var email = $"student-app-{Guid.NewGuid()}@test.com";
        var response = await _client.PostAsJsonAsync("/api/auth/register/student", new
        {
            email,
            password = "Test1234!",
            fullName = "Student Applications",
            university = "NCU",
            programName = "Computer Science"
        });

        var auth = await response.Content.ReadFromJsonAsync<AuthResponse>();
        return auth!.Token;
    }

    private async Task<long> CreateJobAsEmployerAsync(string employerToken)
    {
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", employerToken);

        var createResponse = await _client.PostAsJsonAsync("/api/jobs", new
        {
            title = $"Job for Apps {Guid.NewGuid()}",
            description = "Used by applications tests.",
            employmentType = "full-time"
        });

        _client.DefaultRequestHeaders.Authorization = null;
        createResponse.EnsureSuccessStatusCode();

        var created = await createResponse.Content.ReadFromJsonAsync<JsonElement>();
        return created.GetProperty("id").GetInt64();
    }

    [Fact]
    public async Task GetMyApplications_Unauthenticated_Returns401()
    {
        var response = await _client.GetAsync("/api/applications/me");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetMyApplications_AsEmployer_Returns403()
    {
        var employerToken = await RegisterEmployerAndGetTokenAsync();
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", employerToken);

        var response = await _client.GetAsync("/api/applications/me");

        _client.DefaultRequestHeaders.Authorization = null;
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task GetMyApplications_AsStudentWithNoApplications_ReturnsEmptyList()
    {
        var studentToken = await RegisterStudentAndGetTokenAsync();
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", studentToken);

        var response = await _client.GetAsync("/api/applications/me");

        _client.DefaultRequestHeaders.Authorization = null;
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var items = await response.Content.ReadFromJsonAsync<JsonElement[]>();
        Assert.NotNull(items);
        Assert.Empty(items);
    }

    [Fact]
    public async Task GetMyApplications_AfterApplying_ReturnsSubmittedApplication()
    {
        var employerToken = await RegisterEmployerAndGetTokenAsync();
        var studentToken = await RegisterStudentAndGetTokenAsync();

        var jobId = await CreateJobAsEmployerAsync(employerToken);

        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", studentToken);

        var applyResponse = await _client.PostAsJsonAsync($"/api/jobs/{jobId}/apply", new
        {
            coverLetter = "Application coverage test"
        });
        Assert.Equal(HttpStatusCode.OK, applyResponse.StatusCode);

        var response = await _client.GetAsync("/api/applications/me");

        _client.DefaultRequestHeaders.Authorization = null;
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var items = await response.Content.ReadFromJsonAsync<JsonElement[]>();
        Assert.NotNull(items);
        Assert.Single(items);
        Assert.Equal(jobId, items[0].GetProperty("jobId").GetInt64());
    }
}
