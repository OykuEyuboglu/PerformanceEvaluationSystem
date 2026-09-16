using AutoMapper;
using FluentAssertions;
using Moq;
using PerformanceEvaluation.Application.DTOs.User;
using PerformanceEvaluation.Application.Interfaces;
using PerformanceEvaluation.Application.Services;
using PerformanceEvaluation.Domain.Entities;
using PerformanceEvaluation.Domain.Enums;

namespace PerformanceEvaluation.UnitTests.Services;

public class UserServiceTests
{
    private readonly Mock<IUserRepository> _userRepository = new();
    private readonly Mock<IPasswordHasher> _passwordHasher = new();
    private readonly Mock<IMapper> _mapper = new();

    private readonly UserService _sut;

    public UserServiceTests()
    {
        _sut = new UserService(
            _userRepository.Object,
            _passwordHasher.Object,
            _mapper.Object);
    }

    // ---------------------------------------------------------
    // HELPERS
    // ---------------------------------------------------------

    private static User BuildUser(
        int id = 1,
        string email = "test@example.com",
        UserRole role = UserRole.Employee,
        bool isActive = true,
        bool isDeleted = false)
    {
        return new User
        {
            Id = id,
            FirstName = "AYSE",
            LastName = "YILMAZ",
            Email = email,
            PasswordHash = "hashed",
            Role = role,
            DepartmentId = 1,
            JobPositionId = 1,
            IsActive = isActive,
            IsDeleted = isDeleted,
            CreatedAt = DateTime.Now,
        };
    }

    private static CreateUserDto BuildCreateDto(
        string firstName = "ayşe",
        string lastName = "yılmaz",
        string email = "ayse@example.com",
        string password = "Sifre123!",
        UserRole role = UserRole.Employee,
        int departmentId = 1,
        int? jobPositionId = 1)
    {
        return new CreateUserDto
        {
            FirstName = firstName,
            LastName = lastName,
            Email = email,
            Password = password,
            Role = role,
            DepartmentId = departmentId,
            JobPositionId = jobPositionId
        };
    }

    private void SetupSuccessfulMapping()
    {
        _mapper
            .Setup(m => m.Map<UserDto>(It.IsAny<User>()))
            .Returns(new UserDto());
    }

    // ---------------------------------------------------------
    // GET ALL
    // ---------------------------------------------------------

    [Fact]
    public async Task GetAllAsync_KullanicilarVarsa_TumunuDondurmeli()
    {
        var users = new List<User> { BuildUser(1), BuildUser(2) };

        _userRepository
            .Setup(r => r.GetAllAsync())
            .ReturnsAsync(users);

        _mapper
            .Setup(m => m.Map<IEnumerable<UserDto>>(users))
            .Returns(new List<UserDto> { new(), new() });

        var result = await _sut.GetAllAsync();

        result.Should().HaveCount(2);
        _userRepository.Verify(r => r.GetAllAsync(), Times.Once);
    }

    // ---------------------------------------------------------
    // GET BY ID
    // ---------------------------------------------------------

    [Fact]
    public async Task GetByIdAsync_KullaniciVarsa_KullaniciyiDondurmeli()
    {
        var user = BuildUser(5);

        _userRepository
            .Setup(r => r.GetByIdAsync(5))
            .ReturnsAsync(user);

        SetupSuccessfulMapping();

        var result = await _sut.GetByIdAsync(5);

        result.Should().NotBeNull();
        _userRepository.Verify(r => r.GetByIdAsync(5), Times.Once);
    }

    [Fact]
    public async Task GetByIdAsync_KullaniciYoksa_KeyNotFoundExceptionFirlatmali()
    {
        _userRepository
            .Setup(r => r.GetByIdAsync(It.IsAny<int>()))
            .ReturnsAsync((User?)null);

        var act = async () => await _sut.GetByIdAsync(99);

        await act.Should().ThrowAsync<KeyNotFoundException>();
    }

    // ---------------------------------------------------------
    // CREATE - SUCCESS
    // ---------------------------------------------------------

    [Fact]
    public async Task CreateAsync_GecerliVerilerle_KullaniciOlusturmali()
    {
        User? capturedUser = null;

        _userRepository
            .Setup(r => r.GetByEmailAsync(It.IsAny<string>()))
            .ReturnsAsync((User?)null);

        _passwordHasher
            .Setup(h => h.Hash(It.IsAny<string>()))
            .Returns("hashed-password");

        _userRepository
            .Setup(r => r.AddAsync(It.IsAny<User>()))
            .Callback<User>(u => capturedUser = u)
            .Returns(Task.CompletedTask);

        _userRepository
            .Setup(r => r.SaveChangesAsync())
            .ReturnsAsync(true);

        _userRepository
            .Setup(r => r.GetByIdAsync(It.IsAny<int>()))
            .ReturnsAsync(() => capturedUser);

        SetupSuccessfulMapping();

        var dto = BuildCreateDto(
            firstName: "ayşe",
            lastName: "yılmaz",
            email: "ayse@example.com");

        await _sut.CreateAsync(dto, createdBy: 1);

        capturedUser.Should().NotBeNull();
        capturedUser!.Email.Should().Be("ayse@example.com");
        capturedUser.Role.Should().Be(UserRole.Employee);
        capturedUser.IsActive.Should().BeTrue();
        capturedUser.CreatedBy.Should().Be(1);
        capturedUser.PasswordHash.Should().Be("hashed-password");

        _userRepository.Verify(r => r.AddAsync(It.IsAny<User>()), Times.Once);
        _userRepository.Verify(r => r.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task CreateAsync_AdSoyad_TurkceBuyukHarfeCevrilipBosluklarTemizlenmeli()
    {
        User? capturedUser = null;

        _userRepository
            .Setup(r => r.GetByEmailAsync(It.IsAny<string>()))
            .ReturnsAsync((User?)null);

        _passwordHasher
            .Setup(h => h.Hash(It.IsAny<string>()))
            .Returns("hashed-password");

        _userRepository
            .Setup(r => r.AddAsync(It.IsAny<User>()))
            .Callback<User>(u => capturedUser = u)
            .Returns(Task.CompletedTask);

        _userRepository
            .Setup(r => r.SaveChangesAsync())
            .ReturnsAsync(true);

        _userRepository
            .Setup(r => r.GetByIdAsync(It.IsAny<int>()))
            .ReturnsAsync(() => capturedUser);

        SetupSuccessfulMapping();

        var dto = BuildCreateDto(
            firstName: "  ışık  ",
            lastName: "  güneş  ");

        await _sut.CreateAsync(dto, createdBy: 1);

        // Türkçe kültürde 'ı' -> 'I' değil 'İ' değil özel kurallara tabidir;
        // burada asıl kontrol ettiğimiz: trim + upper uygulanmış olması.
        capturedUser!.FirstName.Should().Be("IŞIK");
        capturedUser.LastName.Should().Be("GÜNEŞ");
    }

    // ---------------------------------------------------------
    // CREATE - VALIDATION
    // ---------------------------------------------------------

    [Fact]
    public async Task CreateAsync_EmailZatenKayitliysa_InvalidOperationExceptionFirlatmali()
    {
        _userRepository
            .Setup(r => r.GetByEmailAsync(It.IsAny<string>()))
            .ReturnsAsync(BuildUser(email: "ayse@example.com"));

        var dto = BuildCreateDto(email: "ayse@example.com");

        var act = async () => await _sut.CreateAsync(dto, createdBy: 1);

        await act.Should().ThrowAsync<InvalidOperationException>();

        _userRepository.Verify(r => r.AddAsync(It.IsAny<User>()), Times.Never);
    }

    // ---------------------------------------------------------
    // UPDATE (FULL)
    // ---------------------------------------------------------

    [Fact]
    public async Task UpdateAsync_KullaniciVarsa_TumAlanlariGuncellemeli()
    {
        var existingUser = BuildUser(3, role: UserRole.Employee, isActive: true);

        _userRepository
            .Setup(r => r.GetByIdAsync(3))
            .ReturnsAsync(existingUser);

        _userRepository
            .Setup(r => r.SaveChangesAsync())
            .ReturnsAsync(true);

        SetupSuccessfulMapping();

        var dto = new UpdateUserDto
        {
            FirstName = "mehmet",
            LastName = "demir",
            Role = UserRole.Evaluator,
            DepartmentId = 2,
            JobPositionId = 4,
            IsActive = false
        };

        await _sut.UpdateAsync(3, dto);

        existingUser.FirstName.Should().Be("MEHMET");
        // Türkçe kültürde küçük 'i' -> noktalı büyük 'İ' olur (I değil).
        existingUser.LastName.Should().Be("DEM\u0130R");
        existingUser.Role.Should().Be(UserRole.Evaluator);
        existingUser.DepartmentId.Should().Be(2);
        existingUser.JobPositionId.Should().Be(4);
        existingUser.IsActive.Should().BeFalse();

        _userRepository.Verify(r => r.Update(existingUser), Times.Once);
        _userRepository.Verify(r => r.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task UpdateAsync_KullaniciYoksa_KeyNotFoundExceptionFirlatmali()
    {
        _userRepository
            .Setup(r => r.GetByIdAsync(It.IsAny<int>()))
            .ReturnsAsync((User?)null);

        var dto = new UpdateUserDto
        {
            FirstName = "mehmet",
            LastName = "demir",
            Role = UserRole.Evaluator,
            DepartmentId = 2,
            IsActive = true
        };

        var act = async () => await _sut.UpdateAsync(99, dto);

        await act.Should().ThrowAsync<KeyNotFoundException>();
    }

    // ---------------------------------------------------------
    // PATCH (PARTIAL UPDATE)
    // ---------------------------------------------------------

    [Fact]
    public async Task PatchAsync_SadeceIsActiveGonderilirse_SadeceOAlanGuncellenmeli()
    {
        var existingUser = BuildUser(
            7,
            role: UserRole.Employee,
            isActive: true);
        existingUser.FirstName = "ORIJINAL";
        existingUser.LastName = "SOYAD";
        existingUser.DepartmentId = 1;
        existingUser.JobPositionId = 1;

        _userRepository
            .Setup(r => r.GetByIdAsync(7))
            .ReturnsAsync(existingUser);

        _userRepository
            .Setup(r => r.SaveChangesAsync())
            .ReturnsAsync(true);

        SetupSuccessfulMapping();

        var dto = new UpdatePatchUserDto
        {
            IsActive = false
        };

        await _sut.PatchAsync(7, dto);

        existingUser.IsActive.Should().BeFalse();
        // Gönderilmeyen alanlar değişmemeli
        existingUser.FirstName.Should().Be("ORIJINAL");
        existingUser.LastName.Should().Be("SOYAD");
        existingUser.DepartmentId.Should().Be(1);
        existingUser.JobPositionId.Should().Be(1);
    }

    [Fact]
    public async Task PatchAsync_KullaniciYoksa_KeyNotFoundExceptionFirlatmali()
    {
        _userRepository
            .Setup(r => r.GetByIdAsync(It.IsAny<int>()))
            .ReturnsAsync((User?)null);

        var dto = new UpdatePatchUserDto { IsActive = true };

        var act = async () => await _sut.PatchAsync(123, dto);

        await act.Should().ThrowAsync<KeyNotFoundException>();
    }

    // ---------------------------------------------------------
    // DELETE (SOFT DELETE)
    // ---------------------------------------------------------

    [Fact]
    public async Task DeleteAsync_KullaniciVarsa_SoftDeleteYapmali()
    {
        var existingUser = BuildUser(10, isDeleted: false);

        _userRepository
            .Setup(r => r.GetByIdAsync(10))
            .ReturnsAsync(existingUser);

        _userRepository
            .Setup(r => r.SaveChangesAsync())
            .ReturnsAsync(true);

        await _sut.DeleteAsync(10);

        existingUser.IsDeleted.Should().BeTrue();
        _userRepository.Verify(r => r.Update(existingUser), Times.Once);
        _userRepository.Verify(r => r.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task DeleteAsync_KullaniciYoksa_ExceptionFirlatmali()
    {
        _userRepository
            .Setup(r => r.GetByIdAsync(It.IsAny<int>()))
            .ReturnsAsync((User?)null);

        var act = async () => await _sut.DeleteAsync(999);

        await act.Should().ThrowAsync<Exception>();
    }

    [Fact]
    public async Task DeleteAsync_KullaniciZatenSilinmisse_ExceptionFirlatmali()
    {
        var existingUser = BuildUser(11, isDeleted: true);

        _userRepository
            .Setup(r => r.GetByIdAsync(11))
            .ReturnsAsync(existingUser);

        var act = async () => await _sut.DeleteAsync(11);

        await act.Should().ThrowAsync<Exception>();

        _userRepository.Verify(r => r.SaveChangesAsync(), Times.Never);
    }
}