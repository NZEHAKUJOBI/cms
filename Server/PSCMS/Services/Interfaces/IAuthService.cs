using PSCMS.DTOs.Auth;

namespace PSCMS.Services.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto?> LoginAsync(LoginDto dto);
    Task<AuthResponseDto> RegisterAsync(RegisterDto dto);
    Task<bool> ChangePasswordAsync(Guid userId, ChangePasswordDto dto);
    Task<List<UserDto>> GetUsersAsync();
    Task<UserDto> CreateUserAsync(CreateUserDto dto);
    Task<UserDto?> UpdateUserAsync(Guid id, UpdateUserDto dto);
    Task<List<UserDto>> GetFacilityUsersAsync(Guid facilityId);
    Task<UserDto> CreateFacilityUserAsync(CreateUserDto dto, Guid managerFacilityId);
    Task<UserDto?> ToggleFacilityUserAsync(Guid userId, Guid managerFacilityId, bool isActive);
    Task<(bool Found, string PlainToken)> CreatePasswordResetTokenAsync(string email);
    Task<bool> ResetPasswordAsync(ResetPasswordDto dto);
}
