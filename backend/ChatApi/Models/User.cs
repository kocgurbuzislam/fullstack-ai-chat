namespace ChatApi.Models {
  public class User {
    public int Id { get; set; }
    public string Nickname { get; set; } = default!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
  }
}
