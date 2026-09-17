using System.Linq.Expressions;
using System.Security.Claims;
using Moq;
using PerformanceEvaluation.Application.DTOs.EvaluatorEmployee;
using PerformanceEvaluation.Application.Interfaces;
using PerformanceEvaluation.Application.Services;
using PerformanceEvaluation.Domain.Common;
using PerformanceEvaluation.Domain.Entities;
using PerformanceEvaluation.Domain.Enums;

namespace PerformanceEvaluation.UnitTests.Services;

public class EvaluatorEmployeeServiceTests
{
    private readonly Mock<IEvaluatorEmployeeRepository> _repositoryMock;
    private readonly Mock<IUserRepository> _userRepositoryMock;

    private readonly EvaluatorEmployeeService _service;

    public EvaluatorEmployeeServiceTests()
    {
        _repositoryMock = new Mock<IEvaluatorEmployeeRepository>();
        _userRepositoryMock = new Mock<IUserRepository>();

        _service = new EvaluatorEmployeeService(
            _repositoryMock.Object,
            _userRepositoryMock.Object);
    }

    private static User CreateEvaluator(
        int id = 1,
        bool isActive = true)
    {
        return new User
        {
            Id = id,
            FirstName = "Deniz",
            LastName = "Kaya",
            Email = "deniz@example.com",
            Role = UserRole.Evaluator,
            IsActive = isActive,
            DepartmentId = 1
        };
    }

    private static User CreateEmployee(
        int id = 2,
        bool isActive = true)
    {
        return new User
        {
            Id = id,
            FirstName = "Ayşe",
            LastName = "Yılmaz",
            Email = "ayse@example.com",
            Role = UserRole.Employee,
            IsActive = isActive,
            DepartmentId = 1,
            JobPositionId = 10,
            JobPosition = new JobPosition
            {
                Id = 10,
                Name = "Yazılım Geliştirici"
            }
        };
    }

    private static ClaimsPrincipal CreateClaimsPrincipal(
        int userId,
        string role)
    {
        var claims = new[]
        {
            new Claim(
                ClaimTypes.NameIdentifier,
                userId.ToString()),

            new Claim(
                ClaimTypes.Role,
                role)
        };

        return new ClaimsPrincipal(
            new ClaimsIdentity(
                claims,
                "TestAuth"));
    }

    [Fact]
    public async Task AssignAsync_GecerliEvaluatorVeEmployee_IseAtamaYapmali()
    {
        // Arrange
        var evaluator = CreateEvaluator();
        var employee = CreateEmployee();

        var dto = new AssignEvaluatorEmployeeDto
        {
            EvaluatorId = evaluator.Id,
            EmployeeId = employee.Id
        };

        _userRepositoryMock
            .Setup(x => x.GetByIdAsync(evaluator.Id))
            .ReturnsAsync(evaluator);

        _userRepositoryMock
            .Setup(x => x.GetByIdAsync(employee.Id))
            .ReturnsAsync(employee);

        _repositoryMock
            .Setup(x => x.ExistsAsync(
                evaluator.Id,
                employee.Id))
            .ReturnsAsync(false);

        _repositoryMock
            .Setup(x => x.AddAsync(It.IsAny<EvaluatorEmployee>()))
            .Returns(Task.CompletedTask);

        _repositoryMock
            .Setup(x => x.SaveChangesAsync())
            .ReturnsAsync(true);

        // Act
        var result = await _service.AssignAsync(dto);

        // Assert
        Assert.NotNull(result);

        Assert.Equal(
            evaluator.Id,
            result.EvaluatorId);

        Assert.Equal(
            evaluator.FirstName + " " + evaluator.LastName,
            result.EvaluatorName);

        Assert.Equal(
            employee.Id,
            result.EmployeeId);

        Assert.Equal(
            employee.FirstName + " " + employee.LastName,
            result.EmployeeName);

        Assert.Equal(
            employee.JobPositionId,
            result.EmployeeJobPositionId);

        Assert.Equal(
            employee.JobPosition!.Name,
            result.EmployeeJobPositionName);

        _repositoryMock.Verify(
            x => x.AddAsync(
                It.Is<EvaluatorEmployee>(a =>
                    a.EvaluatorId == evaluator.Id &&
                    a.EmployeeId == employee.Id)),
            Times.Once);

        _repositoryMock.Verify(
            x => x.SaveChangesAsync(),
            Times.Once);
    }

    [Fact]
    public async Task AssignAsync_EvaluatorBulunamazsa_KeyNotFoundExceptionFirlatmali()
    {
        // Arrange
        var dto = new AssignEvaluatorEmployeeDto
        {
            EvaluatorId = 999,
            EmployeeId = 2
        };

        _userRepositoryMock
            .Setup(x => x.GetByIdAsync(dto.EvaluatorId))
            .ReturnsAsync((User?)null);

        // Act
        var exception = await Assert.ThrowsAsync<KeyNotFoundException>(
            () => _service.AssignAsync(dto));

        // Assert
        Assert.Equal(
            "Evaluator bulunamadı.",
            exception.Message);

        _repositoryMock.Verify(
            x => x.AddAsync(It.IsAny<EvaluatorEmployee>()),
            Times.Never);

        _repositoryMock.Verify(
            x => x.SaveChangesAsync(),
            Times.Never);
    }

    [Fact]
    public async Task AssignAsync_EmployeeBulunamazsa_KeyNotFoundExceptionFirlatmali()
    {
        // Arrange
        var evaluator = CreateEvaluator();

        var dto = new AssignEvaluatorEmployeeDto
        {
            EvaluatorId = evaluator.Id,
            EmployeeId = 999
        };

        _userRepositoryMock
            .Setup(x => x.GetByIdAsync(evaluator.Id))
            .ReturnsAsync(evaluator);

        _userRepositoryMock
            .Setup(x => x.GetByIdAsync(dto.EmployeeId))
            .ReturnsAsync((User?)null);

        // Act
        var exception = await Assert.ThrowsAsync<KeyNotFoundException>(
            () => _service.AssignAsync(dto));

        // Assert
        Assert.Equal(
            "Employee bulunamadı.",
            exception.Message);

        _repositoryMock.Verify(
            x => x.AddAsync(It.IsAny<EvaluatorEmployee>()),
            Times.Never);
    }

    [Fact]
    public async Task AssignAsync_KullaniciEvaluatorDegilse_InvalidOperationExceptionFirlatmali()
    {
        // Arrange
        var evaluator = CreateEvaluator();
        evaluator.Role = UserRole.Employee;

        var employee = CreateEmployee();

        var dto = new AssignEvaluatorEmployeeDto
        {
            EvaluatorId = evaluator.Id,
            EmployeeId = employee.Id
        };

        _userRepositoryMock
            .Setup(x => x.GetByIdAsync(evaluator.Id))
            .ReturnsAsync(evaluator);

        _userRepositoryMock
            .Setup(x => x.GetByIdAsync(employee.Id))
            .ReturnsAsync(employee);

        // Act
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _service.AssignAsync(dto));

        // Assert
        Assert.Equal(
            "Seçilen kullanıcı Evaluator rolünde değil.",
            exception.Message);
    }

    [Fact]
    public async Task AssignAsync_KullaniciEmployeeDegilse_InvalidOperationExceptionFirlatmali()
    {
        // Arrange
        var evaluator = CreateEvaluator();
        var employee = CreateEmployee();
        employee.Role = UserRole.Evaluator;

        var dto = new AssignEvaluatorEmployeeDto
        {
            EvaluatorId = evaluator.Id,
            EmployeeId = employee.Id
        };

        _userRepositoryMock
            .Setup(x => x.GetByIdAsync(evaluator.Id))
            .ReturnsAsync(evaluator);

        _userRepositoryMock
            .Setup(x => x.GetByIdAsync(employee.Id))
            .ReturnsAsync(employee);

        // Act
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _service.AssignAsync(dto));

        // Assert
        Assert.Equal(
            "Seçilen kullanıcı Employee rolünde değil.",
            exception.Message);
    }

    [Fact]
    public async Task AssignAsync_PasifEvaluator_Ise_AtamaYapilmamali()
    {
        // Arrange
        var evaluator = CreateEvaluator(isActive: false);
        var employee = CreateEmployee();

        var dto = new AssignEvaluatorEmployeeDto
        {
            EvaluatorId = evaluator.Id,
            EmployeeId = employee.Id
        };

        _userRepositoryMock
            .Setup(x => x.GetByIdAsync(evaluator.Id))
            .ReturnsAsync(evaluator);

        _userRepositoryMock
            .Setup(x => x.GetByIdAsync(employee.Id))
            .ReturnsAsync(employee);

        // Act
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _service.AssignAsync(dto));

        // Assert
        Assert.Equal(
            "Pasif bir Evaluator'a çalışan atanamaz.",
            exception.Message);

        _repositoryMock.Verify(
            x => x.AddAsync(It.IsAny<EvaluatorEmployee>()),
            Times.Never);
    }

    [Fact]
    public async Task AssignAsync_PasifEmployee_Ise_AtamaYapilmamali()
    {
        // Arrange
        var evaluator = CreateEvaluator();
        var employee = CreateEmployee(isActive: false);

        var dto = new AssignEvaluatorEmployeeDto
        {
            EvaluatorId = evaluator.Id,
            EmployeeId = employee.Id
        };

        _userRepositoryMock
            .Setup(x => x.GetByIdAsync(evaluator.Id))
            .ReturnsAsync(evaluator);

        _userRepositoryMock
            .Setup(x => x.GetByIdAsync(employee.Id))
            .ReturnsAsync(employee);

        // Act
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _service.AssignAsync(dto));

        // Assert
        Assert.Equal(
            "Pasif bir Employee değerlendiriciye atanamaz.",
            exception.Message);
    }

    [Fact]
    public async Task AssignAsync_EvaluatorKendisineAtanmayaCalisilirsa_HataFirlatmali()
    {
        // Arrange
        var evaluator = CreateEvaluator();

        var dto = new AssignEvaluatorEmployeeDto
        {
            EvaluatorId = evaluator.Id,
            EmployeeId = evaluator.Id
        };

        _userRepositoryMock
            .Setup(x => x.GetByIdAsync(evaluator.Id))
            .ReturnsAsync(evaluator);

        // Aynı kullanıcı hem evaluator hem employee olarak
        // repository'den dönebilsin.
        _userRepositoryMock
            .Setup(x => x.GetByIdAsync(dto.EmployeeId))
            .ReturnsAsync(evaluator);

        // Act
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _service.AssignAsync(dto));

        // Assert
        Assert.Equal(
            "Seçilen kullanıcı Employee rolünde değil.",
            exception.Message);
    }

    [Fact]
    public async Task AssignAsync_ZatenAtamaVarsa_HataFirlatmali()
    {
        // Arrange
        var evaluator = CreateEvaluator();
        var employee = CreateEmployee();

        var dto = new AssignEvaluatorEmployeeDto
        {
            EvaluatorId = evaluator.Id,
            EmployeeId = employee.Id
        };

        _userRepositoryMock
            .Setup(x => x.GetByIdAsync(evaluator.Id))
            .ReturnsAsync(evaluator);

        _userRepositoryMock
            .Setup(x => x.GetByIdAsync(employee.Id))
            .ReturnsAsync(employee);

        _repositoryMock
            .Setup(x => x.ExistsAsync(
                evaluator.Id,
                employee.Id))
            .ReturnsAsync(true);

        // Act
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _service.AssignAsync(dto));

        // Assert
        Assert.Equal(
            "Bu çalışan zaten bu Evaluator'a atanmış.",
            exception.Message);

        _repositoryMock.Verify(
            x => x.AddAsync(It.IsAny<EvaluatorEmployee>()),
            Times.Never);

        _repositoryMock.Verify(
            x => x.SaveChangesAsync(),
            Times.Never);
    }

    [Fact]
    public async Task GetByEvaluatorIdAsync_AdminIse_EkibiGorebilmeli()
    {
        // Arrange
        var evaluator = CreateEvaluator();
        var employee = CreateEmployee();

        var assignment = new EvaluatorEmployee
        {
            Id = 100,
            EvaluatorId = evaluator.Id,
            EmployeeId = employee.Id,
            Evaluator = evaluator,
            Employee = employee
        };

        _repositoryMock
            .Setup(x => x.GetByEvaluatorIdAsync(evaluator.Id))
            .ReturnsAsync(new[] { assignment });

        var claims = CreateClaimsPrincipal(
            999,
            "Admin");

        // Act
        var result = await _service.GetByEvaluatorIdAsync(
            evaluator.Id,
            claims);

        // Assert
        var item = Assert.Single(result);

        Assert.Equal(100, item.Id);
        Assert.Equal(evaluator.Id, item.EvaluatorId);
        Assert.Equal("Deniz Kaya", item.EvaluatorName);
        Assert.Equal(employee.Id, item.EmployeeId);
        Assert.Equal("Ayşe Yılmaz", item.EmployeeName);
        Assert.Equal(10, item.EmployeeJobPositionId);
        Assert.Equal(
            "Yazılım Geliştirici",
            item.EmployeeJobPositionName);

        _repositoryMock.Verify(
            x => x.GetByEvaluatorIdAsync(evaluator.Id),
            Times.Once);
    }

    [Fact]
    public async Task GetByEvaluatorIdAsync_EvaluatorKendiEkibiniIseGorebilmeli()
    {
        // Arrange
        var evaluator = CreateEvaluator();
        var employee = CreateEmployee();

        var assignment = new EvaluatorEmployee
        {
            Id = 100,
            EvaluatorId = evaluator.Id,
            EmployeeId = employee.Id,
            Evaluator = evaluator,
            Employee = employee
        };

        _repositoryMock
            .Setup(x => x.GetByEvaluatorIdAsync(evaluator.Id))
            .ReturnsAsync(new[] { assignment });

        var claims = CreateClaimsPrincipal(
            evaluator.Id,
            "Evaluator");

        // Act
        var result = await _service.GetByEvaluatorIdAsync(
            evaluator.Id,
            claims);

        // Assert
        var item = Assert.Single(result);

        Assert.Equal(employee.Id, item.EmployeeId);
        Assert.Equal("Ayşe Yılmaz", item.EmployeeName);
    }

    [Fact]
    public async Task GetByEvaluatorIdAsync_EvaluatorBaskaEvaluatorinEkibiniGoruntuleyemez()
    {
        // Arrange
        var evaluator = CreateEvaluator(id: 1);

        var claims = CreateClaimsPrincipal(
            2,
            "Evaluator");

        // Act
        var exception = await Assert.ThrowsAsync<ForbiddenAccessException>(
            () => _service.GetByEvaluatorIdAsync(
                evaluator.Id,
                claims));

        // Assert
        Assert.Equal(
            "Başka bir Evaluator'ın ekibini görüntüleme yetkiniz yok.",
            exception.Message);

        _repositoryMock.Verify(
            x => x.GetByEvaluatorIdAsync(It.IsAny<int>()),
            Times.Never);
    }

    [Fact]
    public async Task GetByEvaluatorIdAsync_EmployeeIse_EkibiGorememeli()
    {
        // Arrange
        var claims = CreateClaimsPrincipal(
            2,
            "Employee");

        // Act
        var exception = await Assert.ThrowsAsync<ForbiddenAccessException>(
            () => _service.GetByEvaluatorIdAsync(
                1,
                claims));

        // Assert
        Assert.Equal(
            "Bu bilgileri görüntüleme yetkiniz yok.",
            exception.Message);

        _repositoryMock.Verify(
            x => x.GetByEvaluatorIdAsync(It.IsAny<int>()),
            Times.Never);
    }

    [Fact]
    public async Task GetByEvaluatorIdAsync_RolBulunamazsa_ErişimReddedilmeli()
    {
        // Arrange
        var claims = CreateClaimsPrincipal(
            1,
            "");

        // Act
        var exception = await Assert.ThrowsAsync<ForbiddenAccessException>(
            () => _service.GetByEvaluatorIdAsync(
                1,
                claims));

        // Assert
        Assert.Equal(
            "Bu bilgileri görüntüleme yetkiniz yok.",
            exception.Message);
    }

    [Fact]
    public async Task GetByEvaluatorIdAsync_KullaniciKimligiBulunamazsa_UnauthorizedExceptionFirlatmali()
    {
        // Arrange
        var claims = new ClaimsPrincipal(
            new ClaimsIdentity(
                new[]
                {
                    new Claim(
                        ClaimTypes.Role,
                        "Evaluator")
                },
                "TestAuth"));

        // Act
        var exception = await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => _service.GetByEvaluatorIdAsync(
                1,
                claims));

        // Assert
        Assert.Equal(
            "Kullanıcı kimliği bulunamadı.",
            exception.Message);
    }

    [Fact]
    public async Task RemoveAsync_MevcutAtamayiSilip_Kaydetmeli()
    {
        // Arrange
        var assignment = new EvaluatorEmployee
        {
            Id = 100,
            EvaluatorId = 1,
            EmployeeId = 2
        };

        _repositoryMock
            .Setup(x => x.FindAsync(
                It.IsAny<Expression<Func<EvaluatorEmployee, bool>>>()))
            .ReturnsAsync(new[] { assignment });

        _repositoryMock
            .Setup(x => x.SaveChangesAsync())
            .ReturnsAsync(true);

        // Act
        await _service.RemoveAsync(1, 2);

        // Assert
        _repositoryMock.Verify(
            x => x.Remove(assignment),
            Times.Once);

        _repositoryMock.Verify(
            x => x.SaveChangesAsync(),
            Times.Once);
    }

    [Fact]
    public async Task RemoveAsync_AtamaBulunamazsa_KeyNotFoundExceptionFirlatmali()
    {
        // Arrange
        _repositoryMock
            .Setup(x => x.FindAsync(
                It.IsAny<Expression<Func<EvaluatorEmployee, bool>>>()))
            .ReturnsAsync(Array.Empty<EvaluatorEmployee>());

        // Act
        var exception = await Assert.ThrowsAsync<KeyNotFoundException>(
            () => _service.RemoveAsync(1, 2));

        // Assert
        Assert.Equal(
            "Evaluator-Employee ataması bulunamadı.",
            exception.Message);

        _repositoryMock.Verify(
            x => x.Remove(It.IsAny<EvaluatorEmployee>()),
            Times.Never);

        _repositoryMock.Verify(
            x => x.SaveChangesAsync(),
            Times.Never);
    }
}