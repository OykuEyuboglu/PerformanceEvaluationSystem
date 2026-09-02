using PerformanceEvaluation.Application.DTOs;

namespace PerformanceEvaluation.Application.Interfaces;

public interface IUserService
{
    Task<IEnumerable<UserDto>> GetAllAsync();
    Task<UserDto> GetByIdAsync(int id);
    Task<UserDto> CreateAsync(CreateUserDto dto, int createdBy);
    Task<UserDto> UpdateAsync(int id, UpdateUserDto dto);
    Task<UserDto> PatchAsync(int id, UpdatePatchUserDto dto);
}