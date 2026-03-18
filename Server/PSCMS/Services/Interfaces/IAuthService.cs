using PSCMS.DTOs.Auth;

namespace PSCMS.Services.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto?> LoginAsync(LoginDto dto);
    Task<AuthResponseDto> RegisterAsync(RegisterDto dto);
    Task<bool> ChangePasswordAsync(Guid userId, ChangePasswordDto dto);
}
