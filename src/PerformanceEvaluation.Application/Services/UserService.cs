using AutoMapper;
using PerformanceEvaluation.Application.DTOs.User;
using PerformanceEvaluation.Application.Interfaces;
using PerformanceEvaluation.Domain.Entities;
using System.Globalization;

namespace PerformanceEvaluation.Application.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IMapper _mapper;

    public UserService(IUserRepository userRepository, IPasswordHasher passwordHasher, IMapper mapper)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _mapper = mapper;
    }

    public async Task<IEnumerable<UserDto>> GetAllAsync()
    {
        var users = await _userRepository.GetAllAsync();
        return _mapper.Map<IEnumerable<UserDto>>(users);
    }

    public async Task<UserDto> GetByIdAsync(int id)
    {
        var user = await _userRepository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Kullanıcı bulunamadı.");
        return _mapper.Map<UserDto>(user);
    }

    public async Task<UserDto> CreateAsync(CreateUserDto dto, int createdBy)
    {
        var existing = await _userRepository.GetByEmailAsync(dto.Email);
        if (existing is not null)
            throw new InvalidOperationException("Bu email adresi zaten kayıtlı.");

        var turkishCulture = new CultureInfo("tr-TR");

        var user = new User
        {
            FirstName = dto.FirstName.Trim().ToUpper(turkishCulture),
            LastName = dto.LastName.Trim().ToUpper(turkishCulture),
            Email = dto.Email,
            PasswordHash = _passwordHasher.Hash(dto.Password),
            Role = dto.Role,
            DepartmentId = dto.DepartmentId,
            JobPositionId = dto.JobPositionId,
            IsActive = true,
            CreatedAt = DateTime.Now,
            UpdatedAt = DateTime.Now,
            CreatedBy = createdBy,
        };

        await _userRepository.AddAsync(user);
        await _userRepository.SaveChangesAsync();

        return _mapper.Map<UserDto>(user);
    }

    public async Task<UserDto> UpdateAsync(int id, UpdateUserDto dto)
    {
        var user = await _userRepository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Kullanıcı bulunamadı.");
        var turkishCulture = new CultureInfo("tr-TR");

        user.FirstName = dto.FirstName.Trim().ToUpper(turkishCulture);
        user.LastName = dto.LastName.Trim().ToUpper(turkishCulture);
        user.Role = dto.Role;
        user.DepartmentId = dto.DepartmentId;
        user.JobPositionId = dto.JobPositionId;
        user.IsActive = dto.IsActive;
        user.UpdatedAt = DateTime.Now;

        _userRepository.Update(user);
        await _userRepository.SaveChangesAsync();

        var updatedUser = await _userRepository.GetByIdAsync(user.Id);

        return _mapper.Map<UserDto>(updatedUser);
    }

    public async Task<UserDto> PatchAsync(int id, UpdatePatchUserDto dto)
    {
        var user = await _userRepository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Kullanıcı bulunamadı.");
        var turkishCulture = new CultureInfo("tr-TR");

        if (dto.FirstName is not null)
            user.FirstName = dto.FirstName.Trim().ToUpper(turkishCulture);


        if (dto.LastName is not null)
            user.LastName = dto.LastName.Trim().ToUpper(turkishCulture);

        if (dto.Role.HasValue)
            user.Role = dto.Role.Value;

        if (dto.DepartmentId.HasValue)
            user.DepartmentId = dto.DepartmentId.Value;

        if (dto.JobPositionId.HasValue)
            user.JobPositionId = dto.JobPositionId.Value;

        if (dto.IsActive.HasValue)
            user.IsActive = dto.IsActive.Value;

        user.UpdatedAt = DateTime.Now;

        _userRepository.Update(user);
        await _userRepository.SaveChangesAsync();

        var updatedUser = await _userRepository.GetByIdAsync(user.Id);

        return _mapper.Map<UserDto>(updatedUser);
    }
    public async Task DeleteAsync(int id)
    {
        var user = await _userRepository.GetByIdAsync(id)
            ?? throw new Exception("Kullanıcı bulunamadı.");

        if (user.IsDeleted)
            throw new Exception("Kullanıcı zaten silinmiş.");

        user.IsDeleted = true;
        user.UpdatedAt = DateTime.Now;

        _userRepository.Update(user);
        await _userRepository.SaveChangesAsync();
    }
}