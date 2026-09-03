using AutoMapper;
using PerformanceEvaluation.Application.DTOs.User;
using PerformanceEvaluation.Application.Interfaces;

namespace PerformanceEvaluation.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly IMapper _mapper;

    public AuthService(
        IUserRepository userRepository,
        IPasswordHasher passwordHasher,
        IJwtTokenGenerator jwtTokenGenerator,
        IMapper mapper)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _jwtTokenGenerator = jwtTokenGenerator;
        _mapper = mapper;
    }

    public async Task<LoginResponseDto> LoginAsync(LoginRequestDto request)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email)
            ?? throw new UnauthorizedAccessException("Email veya şifre hatalı.");

        if (!user.IsActive)
            throw new UnauthorizedAccessException("Kullanıcı hesabı pasif durumda.");

        if (!_passwordHasher.Verify(request.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Email veya şifre hatalı.");

        var (token, expiresAt) = _jwtTokenGenerator.GenerateToken(user);

        return new LoginResponseDto
        {
            Token = token,
            ExpiresAt = expiresAt,
            User = _mapper.Map<UserDto>(user)
        };
    }
}