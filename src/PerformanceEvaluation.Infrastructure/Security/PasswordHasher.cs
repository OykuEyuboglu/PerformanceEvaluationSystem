using PerformanceEvaluation.Application.Interfaces;

namespace PerformanceEvaluation.Infrastructure.Security;

public class PasswordHasher : IPasswordHasher
{

    public string Hash(string password) => BCrypt.Net.BCrypt.HashPassword(password);

    public bool Verify(string password, string hash) => BCrypt.Net.BCrypt.Verify(password, hash);

    //ilk admin eklenmesi için password oluşturulması
    //public void TestHash()
    //{
    //    var hash = BCrypt.Net.BCrypt.HashPassword("a");
    //    Console.WriteLine(hash);
    //}
}