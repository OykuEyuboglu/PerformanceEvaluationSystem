using AutoMapper;
using Moq;
using PerformanceEvaluation.Application.DTOs.User;
using PerformanceEvaluation.Application.Interfaces;
using PerformanceEvaluation.Application.Services;
using PerformanceEvaluation.Domain.Entities;
using PerformanceEvaluation.Domain.Enums;

namespace PerformanceEvaluation.UnitTests.Services;

public class AuthServiceTests
{
    private readonly Mock<IUserRepository> _userRepositoryMock;
    private readonly Mock<IPasswordHasher> _passwordHasherMock;
    private readonly Mock<IJwtTokenGenerator> _jwtTokenGeneratorMock;
    private readonly Mock<IMapper> _mapperMock;

    private readonly AuthService _authService;

    public AuthServiceTests()
    {
        _userRepositoryMock = new Mock<IUserRepository>();
        _passwordHasherMock = new Mock<IPasswordHasher>();
        _jwtTokenGeneratorMock = new Mock<IJwtTokenGenerator>();
        _mapperMock = new Mock<IMapper>();

        _authService = new AuthService(
            _userRepositoryMock.Object,
            _passwordHasherMock.Object,
            _jwtTokenGeneratorMock.Object,
            _mapperMock.Object
        );
    }

    [Fact]
    public async Task LoginAsync_DogruBilgilerle_GirisBasariliOlmali()
    {
        var request = new LoginRequestDto
        {
            Email = "deniz@example.com",
            Password = "Password123!"
        };

        var user = new User
        {
            Id = 1,
            FirstName = "Deniz",
            LastName = "Kaya",
            Email = request.Email,
            PasswordHash = "hashed-password",
            Role = UserRole.Evaluator,
            IsActive = true,
            DepartmentId = 1
        };

        var userDto = new UserDto
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email,
            Role = user.Role.ToString(),
            IsActive = true
        };

        var expiresAt = DateTime.UtcNow.AddHours(1);

        _userRepositoryMock
            .Setup(x => x.GetByEmailAsync(request.Email))
            .ReturnsAsync(user);

        _passwordHasherMock
            .Setup(x => x.Verify(request.Password, user.PasswordHash))
            .Returns(true);

        _jwtTokenGeneratorMock
            .Setup(x => x.GenerateToken(user))
            .Returns(("test-jwt-token", expiresAt));

        _mapperMock
            .Setup(x => x.Map<UserDto>(user))
            .Returns(userDto);

        var result = await _authService.LoginAsync(request);

        Assert.NotNull(result);
        Assert.Equal("test-jwt-token", result.Token);
        Assert.Equal(expiresAt, result.ExpiresAt);
        Assert.NotNull(result.User);
        Assert.Equal(user.Id, result.User.Id);
        Assert.Equal(user.Email, result.User.Email);
        Assert.Equal(user.Role.ToString(), result.User.Role);

        _userRepositoryMock.Verify(
            x => x.GetByEmailAsync(request.Email),
            Times.Once);

        _passwordHasherMock.Verify(
            x => x.Verify(request.Password, user.PasswordHash),
            Times.Once);

        _jwtTokenGeneratorMock.Verify(
            x => x.GenerateToken(user),
            Times.Once);

        _mapperMock.Verify(
            x => x.Map<UserDto>(user),
            Times.Once);
    }

    [Fact]
    public async Task LoginAsync_KullaniciBulunamazsa_UnauthorizedAccessExceptionFirlatmali()
    {
        var request = new LoginRequestDto
        {
            Email = "notfound@example.com",
            Password = "Password123!"
        };

        _userRepositoryMock
            .Setup(x => x.GetByEmailAsync(request.Email))
            .ReturnsAsync((User?)null);

        var exception = await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => _authService.LoginAsync(request));

        Assert.Equal(
            "Email veya şifre hatalı.",
            exception.Message);

        _passwordHasherMock.Verify(
            x => x.Verify(It.IsAny<string>(), It.IsAny<string>()),
            Times.Never);

        _jwtTokenGeneratorMock.Verify(
            x => x.GenerateToken(It.IsAny<User>()),
            Times.Never);

        _mapperMock.Verify(
            x => x.Map<UserDto>(It.IsAny<User>()),
            Times.Never);
    }

    [Fact]
    public async Task LoginAsync_KullaniciPasifse_UnauthorizedAccessExceptionFirlatmali()
    {
        var request = new LoginRequestDto
        {
            Email = "inactive@example.com",
            Password = "Password123!"
        };

        var user = new User
        {
            Id = 2,
            FirstName = "Pasif",
            LastName = "Kullanıcı",
            Email = request.Email,
            PasswordHash = "hashed-password",
            Role = UserRole.Employee,
            IsActive = false,
            DepartmentId = 1
        };

        _userRepositoryMock
            .Setup(x => x.GetByEmailAsync(request.Email))
            .ReturnsAsync(user);

        var exception = await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => _authService.LoginAsync(request));

        Assert.Equal(
            "Kullanıcı hesabı pasif durumda.",
            exception.Message);

        _passwordHasherMock.Verify(
            x => x.Verify(It.IsAny<string>(), It.IsAny<string>()),
            Times.Never);

        _jwtTokenGeneratorMock.Verify(
            x => x.GenerateToken(It.IsAny<User>()),
            Times.Never);

        _mapperMock.Verify(
            x => x.Map<UserDto>(It.IsAny<User>()),
            Times.Never);
    }

    [Fact]
    public async Task LoginAsync_YanlisSifre_UnauthorizedAccessExceptionFirlatmali()
    {
        var request = new LoginRequestDto
        {
            Email = "deniz@example.com",
            Password = "WrongPassword!"
        };

        var user = new User
        {
            Id = 1,
            FirstName = "Deniz",
            LastName = "Kaya",
            Email = request.Email,
            PasswordHash = "hashed-password",
            Role = UserRole.Evaluator,
            IsActive = true,
            DepartmentId = 1
        };

        _userRepositoryMock
            .Setup(x => x.GetByEmailAsync(request.Email))
            .ReturnsAsync(user);

        _passwordHasherMock
            .Setup(x => x.Verify(request.Password, user.PasswordHash))
            .Returns(false);

        var exception = await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => _authService.LoginAsync(request));

        Assert.Equal(
            "Email veya şifre hatalı.",
            exception.Message);

        _jwtTokenGeneratorMock.Verify(
            x => x.GenerateToken(It.IsAny<User>()),
            Times.Never);

        _mapperMock.Verify(
            x => x.Map<UserDto>(It.IsAny<User>()),
            Times.Never);
    }

    [Fact]
    public async Task LoginAsync_SifreDogrulama_IcinDogruBilgileriKullanmali()
    {
        var request = new LoginRequestDto
        {
            Email = "employee@example.com",
            Password = "CorrectPassword!"
        };

        var user = new User
        {
            Id = 5,
            FirstName = "Test",
            LastName = "Employee",
            Email = request.Email,
            PasswordHash = "stored-hash",
            Role = UserRole.Employee,
            IsActive = true,
            DepartmentId = 1
        };

        _userRepositoryMock
            .Setup(x => x.GetByEmailAsync(request.Email))
            .ReturnsAsync(user);

        _passwordHasherMock
            .Setup(x => x.Verify(request.Password, user.PasswordHash))
            .Returns(true);

        _jwtTokenGeneratorMock
            .Setup(x => x.GenerateToken(user))
            .Returns(("token", DateTime.UtcNow.AddHours(1)));

        _mapperMock
            .Setup(x => x.Map<UserDto>(user))
            .Returns(new UserDto());

        await _authService.LoginAsync(request);

        _passwordHasherMock.Verify(
            x => x.Verify(
                request.Password,
                "stored-hash"),
            Times.Once);
    }

    [Fact]
    public async Task LoginAsync_TokenUretirken_DogruKullaniciGonderilmeli()
    {
        var request = new LoginRequestDto
        {
            Email = "evaluator@example.com",
            Password = "Password123!"
        };

        var user = new User
        {
            Id = 10,
            FirstName = "Evaluator",
            LastName = "User",
            Email = request.Email,
            PasswordHash = "hash",
            Role = UserRole.Evaluator,
            IsActive = true,
            DepartmentId = 1
        };

        _userRepositoryMock
            .Setup(x => x.GetByEmailAsync(request.Email))
            .ReturnsAsync(user);

        _passwordHasherMock
            .Setup(x => x.Verify(request.Password, user.PasswordHash))
            .Returns(true);

        _jwtTokenGeneratorMock
            .Setup(x => x.GenerateToken(user))
            .Returns(("generated-token", DateTime.UtcNow.AddHours(1)));

        _mapperMock
            .Setup(x => x.Map<UserDto>(user))
            .Returns(new UserDto());

        await _authService.LoginAsync(request);

        _jwtTokenGeneratorMock.Verify(
            x => x.GenerateToken(user),
            Times.Once);
    }
}