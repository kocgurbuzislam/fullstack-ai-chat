using Microsoft.EntityFrameworkCore;
using ChatApi.Models;

namespace ChatApi.Data {
  public class AppDb : DbContext {
    public AppDb(DbContextOptions<AppDb> options) : base(options) { }
    public DbSet<User> Users => Set<User>();
    public DbSet<Message> Messages => Set<Message>();
  }
}
