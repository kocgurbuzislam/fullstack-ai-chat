using ChatApi.Data;
using ChatApi.Models;
using Microsoft.EntityFrameworkCore;
using System.Net.Http.Json;

var builder = WebApplication.CreateBuilder(args);

// EF Core + SQLite
builder.Services.AddDbContext<AppDb>(opt =>
    opt.UseSqlite(builder.Configuration.GetConnectionString("Default")!));

// HTTP client (AI servisi için)
builder.Services.AddHttpClient();

// CORS (web/mobil için)
builder.Services.AddCors(o => o.AddDefaultPolicy(p => p
    .AllowAnyOrigin()
    .AllowAnyHeader()
    .AllowAnyMethod()
));

var app = builder.Build(); // 🔧 <— burada Build() olmalı

app.UseCors();

// Health
app.MapGet("/", () => Results.Ok(new { ok = true }));

// 1) Kullanıcı oluştur
app.MapPost("/api/users", async (AppDb db, User u) =>
{
    if (string.IsNullOrWhiteSpace(u.Nickname)) return Results.BadRequest("nickname required");
    db.Users.Add(u);
    await db.SaveChangesAsync();
    return Results.Created($"/api/users/{u.Id}", u);
});

// 2) Mesajları listele (opsiyonel since & limit)
app.MapGet("/api/messages", async (AppDb db, DateTime? since, int? limit) =>
{
    var q = db.Messages.Include(m => m.User).OrderBy(m => m.CreatedAt).AsQueryable();
    if (since.HasValue) q = q.Where(m => m.CreatedAt > since.Value);
    if (limit.HasValue) q = q.Take(limit.Value);

    var data = await q.Select(m => new
    {
        m.Id,
        m.Text,
        m.Sentiment,
        m.SentimentScore,
        m.CreatedAt,
        user = new { m.User!.Id, m.User.Nickname }
    })
.ToListAsync();

    return Results.Ok(data);
});

// 3) Mesaj gönder + AI analizi
// 3) Mesaj gönder + AI analizi
app.MapPost("/api/messages", async (AppDb db, IHttpClientFactory f, IConfiguration cfg, Message m) =>
{
    var user = await db.Users.FindAsync(m.UserId);
    if (user is null) return Results.BadRequest("invalid userId");
    if (string.IsNullOrWhiteSpace(m.Text)) return Results.BadRequest("text required");

    db.Messages.Add(m);
    await db.SaveChangesAsync();

    try
    {
        var client = f.CreateClient();
        client.Timeout = TimeSpan.FromSeconds(60);

        var aiUrl = cfg["AI_URL"] ?? throw new Exception("AI_URL missing");
        var resp = await client.PostAsJsonAsync(aiUrl, new { text = m.Text });
        var body = await resp.Content.ReadAsStringAsync();

        Console.WriteLine($"[AI] POST {aiUrl} -> {(int)resp.StatusCode} {resp.StatusCode}; body={body}");

        if (resp.IsSuccessStatusCode)
        {
            var payload = System.Text.Json.JsonSerializer.Deserialize<SentimentRes>(
                body,
                new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true }
            );
            if (!string.IsNullOrWhiteSpace(payload?.label))
            {
                m.Sentiment = payload!.label!.ToUpperInvariant();
                m.SentimentScore = payload!.score;   // ⬅️ skor da kaydediliyor
                await db.SaveChangesAsync();
            }

        }
    }
    catch (Exception ex)
    {
        Console.WriteLine("[AI] call failed: " + ex.Message);
        // NEUTRAL kalsın (MVP)
    }

    return Results.Ok(m);
});

app.Run();

public record SentimentRes(string label, double score);
