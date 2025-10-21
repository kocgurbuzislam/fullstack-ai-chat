namespace ChatApi.Models {
  public class Message {
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Text { get; set; } = default!;
    public string Sentiment { get; set; } = "NEUTRAL";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public double SentimentScore { get; set; } = 0.0;

    public User? User { get; set; }
  }
}
