using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using PSCMS.Common;
using PSCMS.DTOs.Auth;
using PSCMS.Services.Interfaces;
using System.Security.Claims;

namespace PSCMS.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService) => _authService = authService;

    /// <summary>Login and receive a JWT token.</summary>
    [HttpPost("login")]
    [EnableRateLimiting("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var result = await _authService.LoginAsync(dto);
        if (result is null)
            return Unauthorized(ApiResponse<string>.Fail("Invalid email or password."));

        return Ok(ApiResponse<AuthResponseDto>.Ok(result, "Login successful."));
    }

    /// <summary>Register a new user (Admin only).</summary>
    [HttpPost("register")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        try
        {
            var result = await _authService.RegisterAsync(dto);
            return CreatedAtAction(nameof(Login), ApiResponse<AuthResponseDto>.Ok(result, "Registration successful."));
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(ApiResponse<string>.Fail(ex.Message));
        }
    }

    /// <summary>Change the current user's password.</summary>
    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var success = await _authService.ChangePasswordAsync(userId, dto);
        if (!success)
            return BadRequest(ApiResponse<string>.Fail("Current password is incorrect."));

        return Ok(ApiResponse<string>.Ok("Password changed.", "Password updated successfully."));
    }

    /// <summary>List all users (Admin only).</summary>
    [HttpGet("users")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _authService.GetUsersAsync();
        return Ok(ApiResponse<List<UserDto>>.Ok(users));
    }

    /// <summary>Create a new user account (Admin only).</summary>
    [HttpPost("users")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserDto dto)
    {
        try
        {
            var user = await _authService.CreateUserAsync(dto);
            return CreatedAtAction(nameof(GetUsers), ApiResponse<UserDto>.Ok(user, "User created."));
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(ApiResponse<string>.Fail(ex.Message));
        }
    }

    /// <summary>Update a user's role, facility, or active status (Admin only).</summary>
    [HttpPut("users/{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UpdateUserDto dto)
    {
        try
        {
            var user = await _authService.UpdateUserAsync(id, dto);
            if (user is null) return NotFound(ApiResponse<string>.Fail("User not found."));
            return Ok(ApiResponse<UserDto>.Ok(user, "User updated."));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<string>.Fail(ex.Message));
        }
    }

    /// <summary>Delete a user account (Admin only).</summary>
    [HttpDelete("users/{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteUser(Guid id)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (Guid.TryParse(currentUserId, out var callerId) && callerId == id)
            return BadRequest(ApiResponse<string>.Fail("You cannot delete your own account."));

        try
        {
            var deleted = await _authService.DeleteUserAsync(id);
            if (!deleted) return NotFound(ApiResponse<string>.Fail("User not found."));
            return Ok(ApiResponse<string>.Ok("Deleted.", "User deleted."));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<string>.Fail(ex.Message));
        }
    }

    /// <summary>List users in the current pharmacist's facility (Pharmacist only).</summary>
    [HttpGet("users/my-facility")]
    [Authorize(Roles = "Pharmacist")]
    public async Task<IActionResult> GetMyFacilityUsers()
    {
        var facilityIdStr = User.FindFirstValue("facilityId");
        if (!Guid.TryParse(facilityIdStr, out var facilityId))
            return BadRequest(ApiResponse<string>.Fail("No facility assigned to this account."));

        var users = await _authService.GetFacilityUsersAsync(facilityId);
        return Ok(ApiResponse<List<UserDto>>.Ok(users));
    }

    /// <summary>Create a user in the current pharmacist's facility (Pharmacist only).</summary>
    [HttpPost("users/my-facility")]
    [Authorize(Roles = "Pharmacist")]
    public async Task<IActionResult> CreateFacilityUser([FromBody] CreateUserDto dto)
    {
        var facilityIdStr = User.FindFirstValue("facilityId");
        if (!Guid.TryParse(facilityIdStr, out var facilityId))
            return BadRequest(ApiResponse<string>.Fail("No facility assigned to this account."));

        try
        {
            var user = await _authService.CreateFacilityUserAsync(dto, facilityId);
            return CreatedAtAction(nameof(GetMyFacilityUsers), ApiResponse<UserDto>.Ok(user, "User created."));
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(ApiResponse<string>.Fail(ex.Message));
        }
    }

    /// <summary>Toggle a user's active status in the pharmacist's facility (Pharmacist only).</summary>
    [HttpPatch("users/my-facility/{id:guid}")]
    [Authorize(Roles = "Pharmacist")]
    public async Task<IActionResult> ToggleFacilityUser(Guid id, [FromBody] ToggleActiveDto dto)
    {
        var facilityIdStr = User.FindFirstValue("facilityId");
        if (!Guid.TryParse(facilityIdStr, out var facilityId))
            return BadRequest(ApiResponse<string>.Fail("No facility assigned to this account."));

        var user = await _authService.ToggleFacilityUserAsync(id, facilityId, dto.IsActive);
        if (user is null) return NotFound(ApiResponse<string>.Fail("User not found or not in your facility."));
        return Ok(ApiResponse<UserDto>.Ok(user, "User updated."));
    }

    /// <summary>List all users in the state manager's state (StateManager only).</summary>
    [HttpGet("users/my-state")]
    [Authorize(Roles = "StateManager")]
    public async Task<IActionResult> GetMyStateUsers()
    {
        var state = User.FindFirstValue("state");
        if (string.IsNullOrWhiteSpace(state))
            return BadRequest(ApiResponse<string>.Fail("No state assigned to this account."));

        var users = await _authService.GetStateUsersAsync(state);
        return Ok(ApiResponse<List<UserDto>>.Ok(users));
    }

    /// <summary>Create a user in a facility within the state manager's state (StateManager only).</summary>
    [HttpPost("users/my-state")]
    [Authorize(Roles = "StateManager")]
    public async Task<IActionResult> CreateStateUser([FromBody] CreateUserDto dto)
    {
        var state = User.FindFirstValue("state");
        if (string.IsNullOrWhiteSpace(state))
            return BadRequest(ApiResponse<string>.Fail("No state assigned to this account."));

        try
        {
            var user = await _authService.CreateStateUserAsync(dto, state);
            return CreatedAtAction(nameof(GetMyStateUsers), ApiResponse<UserDto>.Ok(user, "User created."));
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(ApiResponse<string>.Fail(ex.Message));
        }
    }

    /// <summary>Toggle a user's active status within the state manager's state (StateManager only).</summary>
    [HttpPatch("users/my-state/{id:guid}")]
    [Authorize(Roles = "StateManager")]
    public async Task<IActionResult> ToggleStateUser(Guid id, [FromBody] ToggleActiveDto dto)
    {
        var state = User.FindFirstValue("state");
        if (string.IsNullOrWhiteSpace(state))
            return BadRequest(ApiResponse<string>.Fail("No state assigned to this account."));

        var user = await _authService.ToggleStateUserAsync(id, state, dto.IsActive);
        if (user is null) return NotFound(ApiResponse<string>.Fail("User not found or not in your state."));
        return Ok(ApiResponse<UserDto>.Ok(user, "User updated."));
    }

    /// <summary>
    /// Request a password-reset token. 
    /// In production the token is emailed; in development it is returned in the response body for testing.
    /// </summary>
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
    {
        var (found, token) = await _authService.CreatePasswordResetTokenAsync(dto.Email);

        // Always return 200 to avoid email enumeration
        if (!found) return Ok(ApiResponse<string>.Ok(string.Empty, "If that email exists you will receive a reset link shortly."));

        var isDev = HttpContext.RequestServices.GetRequiredService<IWebHostEnvironment>().IsDevelopment();

        // In dev expose the token directly; in prod you would email it.
        return isDev
            ? Ok(ApiResponse<object>.Ok(new { resetToken = token }, "If that email exists you will receive a reset link shortly."))
            : Ok(ApiResponse<string>.Ok(string.Empty, "If that email exists you will receive a reset link shortly."));
    }

    /// <summary>Reset a password using a valid token from forgot-password.</summary>
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
    {
        var success = await _authService.ResetPasswordAsync(dto);
        if (!success)
            return BadRequest(ApiResponse<string>.Fail("Invalid or expired reset token."));

        return Ok(ApiResponse<string>.Ok("Password reset.", "Password reset successfully."));
    }
}
