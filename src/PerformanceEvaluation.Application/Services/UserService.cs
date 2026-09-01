using AutoMapper;
using PerformanceEvaluation.Application.DTOs;
using PerformanceEvaluation.Application.Interfaces;
using PerformanceEvaluation.Domain.Entities;

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

    public async Task<UserDto> CreateAsync(CreateUserDto dto)
    {
        var existing = await _userRepository.GetByEmailAsync(dto.Email);
        if (existing is not null)
            throw new InvalidOperationException("Bu email adresi zaten kayıtlı.");

        var user = new User
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = dto.Email,
            PasswordHash = _passwordHasher.Hash(dto.Password),
            Role = dto.Role,
            DepartmentId = dto.DepartmentId,
            JobPositionId = dto.JobPositionId,
            IsActive = true
        };

        await _userRepository.AddAsync(user);
        await _userRepository.SaveChangesAsync();

        return _mapper.Map<UserDto>(user);
    }

    public async Task<UserDto> UpdateAsync(int id, UpdateUserDto dto)
    {
        var user = await _userRepository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Kullanıcı bulunamadı.");

        user.FirstName = dto.FirstName;
        user.LastName = dto.LastName;
        user.Role = dto.Role;
        user.DepartmentId = dto.DepartmentId;
        user.JobPositionId = dto.JobPositionId;
        user.IsActive = dto.IsActive;

        _userRepository.Update(user);
        await _userRepository.SaveChangesAsync();

        return _mapper.Map<UserDto>(user);
    }
}