using System.ComponentModel.DataAnnotations;

namespace PSCMS.DTOs.Auth;

public class LoginDto
{
    [Required, EmailAddress, MaxLength(256)]
    public string Email { get; set; } = string.Empty;

    [Required, MinLength(6), MaxLength(128)]
    public string Password { get; set; } = string.Empty;
}

public class RegisterDto
{
    [Required, MinLength(3), MaxLength(64)]
    public string Username { get; set; } = string.Empty;

    [Required, EmailAddress, MaxLength(256)]
    public string Email { get; set; } = string.Empty;

    [Required, MinLength(8), MaxLength(128)]
    public string Password { get; set; } = string.Empty;

    [Required]
    public string Role { get; set; } = "FacilityUser";

    public Guid? FacilityId { get; set; }
}

public class AuthResponseDto
{
    public string Token { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public Guid? FacilityId { get; set; }
    public DateTime ExpiresAt { get; set; }
}

public class ToggleActiveDto
{
    public bool IsActive { get; set; }
}

public class ChangePasswordDto
{
    [Required, MinLength(6), MaxLength(128)]
    public string CurrentPassword { get; set; } = string.Empty;

    [Required, MinLength(8), MaxLength(128)]
    public string NewPassword { get; set; } = string.Empty;
}

public class ForgotPasswordDto
{
    [Required, EmailAddress, MaxLength(256)]
    public string Email { get; set; } = string.Empty;
}

public class ResetPasswordDto
{
    [Required]
    public string Token { get; set; } = string.Empty;

    [Required, MinLength(8), MaxLength(128)]
    public string NewPassword { get; set; } = string.Empty;
}

public class NotificationDto
{
    public string Type { get; set; } = string.Empty;   // "order" | "stock" | "shipment" | "expiry"
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? LinkId { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class BulkImportResultDto
{
    public int Created { get; set; }
    public int Updated { get; set; }
    public int Skipped { get; set; }
    public List<string> Errors { get; set; } = [];
}

public class UserDto
{
    public Guid Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public Guid? FacilityId { get; set; }
    public string? FacilityName { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
}

public class CreateUserDto
{
    [Required, MinLength(3), MaxLength(64)]
    public string Username { get; set; } = string.Empty;

    [Required, EmailAddress, MaxLength(256)]
    public string Email { get; set; } = string.Empty;

    [Required, MinLength(8), MaxLength(128)]
    public string Password { get; set; } = string.Empty;

    [Required]
    public string Role { get; set; } = "FacilityUser";

    public Guid? FacilityId { get; set; }
}

public class UpdateUserDto
{
    public string? Role { get; set; }
    public Guid? FacilityId { get; set; }
    public bool? IsActive { get; set; }
}
