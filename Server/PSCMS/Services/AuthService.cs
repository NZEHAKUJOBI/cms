using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PSCMS.Data;
using PSCMS.DTOs.Auth;
using PSCMS.Models;
using PSCMS.Services.Interfaces;

namespace PSCMS.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;

    public AuthService(AppDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    public async Task<AuthResponseDto?> LoginAsync(LoginDto dto)
    {
        var user = await _db.Users
            .FirstOrDefaultAsync(u => u.Email == dto.Email && u.IsActive);

        if (user is null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            return null;

        user.LastLoginAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return GenerateToken(user);
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
    {
        if (await _db.Users.AnyAsync(u => u.Email == dto.Email))
            throw new InvalidOperationException("Email already registered.");

        if (await _db.Users.AnyAsync(u => u.Username == dto.Username))
            throw new InvalidOperationException("Username already taken.");

        if (!Enum.TryParse<UserRole>(dto.Role, out var role))
            throw new InvalidOperationException($"Invalid role: {dto.Role}.");

        var user = new User
        {
            Username = dto.Username,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = role,
            FacilityId = dto.FacilityId,
            State = dto.State
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return GenerateToken(user);
    }

    public async Task<bool> ChangePasswordAsync(Guid userId, ChangePasswordDto dto)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user is null || !BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
            return false;

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<List<UserDto>> GetUsersAsync()
    {
        return await _db.Users
            .Include(u => u.Facility)
            .OrderBy(u => u.Username)
            .Select(u => new UserDto
            {
                Id = u.Id,
                Username = u.Username,
                Email = u.Email,
                Role = u.Role.ToString(),
                FacilityId = u.FacilityId,
                FacilityName = u.Facility != null ? u.Facility.Name : null,
                State = u.State,
                IsActive = u.IsActive,
                CreatedAt = u.CreatedAt,
                LastLoginAt = u.LastLoginAt
            })
            .ToListAsync();
    }

    public async Task<UserDto> CreateUserAsync(CreateUserDto dto)
    {
        if (await _db.Users.AnyAsync(u => u.Email == dto.Email))
            throw new InvalidOperationException("Email already registered.");

        if (await _db.Users.AnyAsync(u => u.Username == dto.Username))
            throw new InvalidOperationException("Username already taken.");

        if (!Enum.TryParse<UserRole>(dto.Role, out var role))
            throw new InvalidOperationException($"Invalid role: {dto.Role}.");

        var user = new User
        {
            Username = dto.Username,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = role,
            FacilityId = dto.FacilityId,
            State = dto.State
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();
        await _db.Entry(user).Reference(u => u.Facility).LoadAsync();

        return new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            Role = user.Role.ToString(),
            FacilityId = user.FacilityId,
            FacilityName = user.Facility?.Name,
            State = user.State,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt
        };
    }

    public async Task<UserDto?> UpdateUserAsync(Guid id, UpdateUserDto dto)
    {
        var user = await _db.Users.Include(u => u.Facility).FirstOrDefaultAsync(u => u.Id == id);
        if (user is null) return null;

        if (dto.Role is not null)
        {
            if (!Enum.TryParse<UserRole>(dto.Role, out var role))
                throw new InvalidOperationException($"Invalid role: {dto.Role}.");
            user.Role = role;
        }

        if (dto.FacilityId is not null) user.FacilityId = dto.FacilityId;
        if (dto.IsActive is not null) user.IsActive = dto.IsActive.Value;
        if (dto.State is not null) user.State = dto.State;

        user.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        await _db.Entry(user).Reference(u => u.Facility).LoadAsync();

        return new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            Role = user.Role.ToString(),
            FacilityId = user.FacilityId,
            FacilityName = user.Facility?.Name,
            State = user.State,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt
        };
    }

    public async Task<bool> DeleteUserAsync(Guid id)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == id);
        if (user is null) return false;

        // Keep seeded platform admin account protected from deletion.
        if (user.Id == Guid.Parse("00000000-0000-0000-0000-000000000001"))
            throw new InvalidOperationException("The default admin account cannot be deleted.");

        _db.Users.Remove(user);
        await _db.SaveChangesAsync();
        return true;
    }

    private AuthResponseDto GenerateToken(User user)
    {
        var key = _config["Jwt:Key"] ?? throw new InvalidOperationException("JWT key not configured.");
        var issuer = _config["Jwt:Issuer"];
        var audience = _config["Jwt:Audience"];
        var expiryMinutes = int.Parse(_config["Jwt:ExpiryMinutes"] ?? "480");

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
            new Claim("facilityId", user.FacilityId?.ToString() ?? string.Empty),
            new Claim("state", user.State ?? string.Empty)
        };

        var expiresAt = DateTime.UtcNow.AddMinutes(expiryMinutes);
        var token = new JwtSecurityToken(issuer, audience, claims,
            expires: expiresAt,
            signingCredentials: credentials);

        return new AuthResponseDto
        {
            Token = new JwtSecurityTokenHandler().WriteToken(token),
            Username = user.Username,
            Email = user.Email,
            Role = user.Role.ToString(),
            FacilityId = user.FacilityId,
            State = user.State,
            ExpiresAt = expiresAt
        };
    }

    public async Task<List<UserDto>> GetFacilityUsersAsync(Guid facilityId)
    {
        return await _db.Users
            .Include(u => u.Facility)
            .Where(u => u.FacilityId == facilityId)
            .OrderBy(u => u.Username)
            .Select(u => new UserDto
            {
                Id = u.Id,
                Username = u.Username,
                Email = u.Email,
                Role = u.Role.ToString(),
                FacilityId = u.FacilityId,
                FacilityName = u.Facility != null ? u.Facility.Name : null,
                State = u.State,
                IsActive = u.IsActive,
                CreatedAt = u.CreatedAt,
                LastLoginAt = u.LastLoginAt
            })
            .ToListAsync();
    }

    public async Task<UserDto> CreateFacilityUserAsync(CreateUserDto dto, Guid managerFacilityId)
    {
        if (!Enum.TryParse<UserRole>(dto.Role, out var role) ||
            role != UserRole.Pharmacist)
            throw new InvalidOperationException("Only Pharmacist accounts can be created by facility staff.");

        if (await _db.Users.AnyAsync(u => u.Email == dto.Email))
            throw new InvalidOperationException("Email already registered.");

        if (await _db.Users.AnyAsync(u => u.Username == dto.Username))
            throw new InvalidOperationException("Username already taken.");

        var facility = await _db.Facilities.FindAsync(managerFacilityId);

        var user = new User
        {
            Username = dto.Username,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = role,
            FacilityId = managerFacilityId,
            State = facility?.State
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();
        await _db.Entry(user).Reference(u => u.Facility).LoadAsync();

        return new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            Role = user.Role.ToString(),
            FacilityId = user.FacilityId,
            FacilityName = user.Facility?.Name,
            State = user.State,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt
        };
    }

    public async Task<UserDto?> ToggleFacilityUserAsync(Guid userId, Guid managerFacilityId, bool isActive)
    {
        var user = await _db.Users
            .Include(u => u.Facility)
            .FirstOrDefaultAsync(u => u.Id == userId && u.FacilityId == managerFacilityId);

        if (user is null) return null;

        user.IsActive = isActive;
        user.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            Role = user.Role.ToString(),
            FacilityId = user.FacilityId,
            FacilityName = user.Facility?.Name,
            State = user.State,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt
        };
    }

    public async Task<List<UserDto>> GetStateUsersAsync(string state)
    {
        return await _db.Users
            .Include(u => u.Facility)
            .Where(u => u.FacilityId.HasValue && u.Facility!.State == state)
            .OrderBy(u => u.Username)
            .Select(u => new UserDto
            {
                Id = u.Id,
                Username = u.Username,
                Email = u.Email,
                Role = u.Role.ToString(),
                FacilityId = u.FacilityId,
                FacilityName = u.Facility != null ? u.Facility.Name : null,
                State = u.State,
                IsActive = u.IsActive,
                CreatedAt = u.CreatedAt,
                LastLoginAt = u.LastLoginAt
            })
            .ToListAsync();
    }

    public async Task<UserDto> CreateStateUserAsync(CreateUserDto dto, string managerState)
    {
        if (!Enum.TryParse<UserRole>(dto.Role, out var role) ||
            (role != UserRole.Laboratory && role != UserRole.Pharmacist))
            throw new InvalidOperationException("StateManager can only create Laboratory and Pharmacist accounts.");

        if (!dto.FacilityId.HasValue)
            throw new InvalidOperationException("A facility is required when creating users as a State Manager.");

        var facility = await _db.Facilities.FindAsync(dto.FacilityId.Value)
            ?? throw new InvalidOperationException("Facility not found.");

        if (!string.Equals(facility.State, managerState, StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException("The selected facility is not in your state.");

        if (await _db.Users.AnyAsync(u => u.Email == dto.Email))
            throw new InvalidOperationException("Email already registered.");

        if (await _db.Users.AnyAsync(u => u.Username == dto.Username))
            throw new InvalidOperationException("Username already taken.");

        var user = new User
        {
            Username = dto.Username,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = role,
            FacilityId = dto.FacilityId,
            State = facility.State
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();
        await _db.Entry(user).Reference(u => u.Facility).LoadAsync();

        return new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            Role = user.Role.ToString(),
            FacilityId = user.FacilityId,
            FacilityName = user.Facility?.Name,
            State = user.State,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt
        };
    }

    public async Task<UserDto?> ToggleStateUserAsync(Guid userId, string managerState, bool isActive)
    {
        var user = await _db.Users
            .Include(u => u.Facility)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user is null || user.Facility is null || !string.Equals(user.Facility.State, managerState, StringComparison.OrdinalIgnoreCase))
            return null;

        user.IsActive = isActive;
        user.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            Role = user.Role.ToString(),
            FacilityId = user.FacilityId,
            FacilityName = user.Facility?.Name,
            State = user.State,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt
        };
    }

    /// <summary>
    /// Creates a password-reset token. In production wire this to email.
    /// Returns the plain-text token so the caller can log/emit it for dev use.
    /// </summary>
    public async Task<(bool Found, string PlainToken)> CreatePasswordResetTokenAsync(string email)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email && u.IsActive);
        if (user is null) return (false, string.Empty);

        // Invalidate any existing unused tokens
        var old = await _db.PasswordResetTokens
            .Where(t => t.UserId == user.Id && !t.IsUsed)
            .ToListAsync();
        _db.PasswordResetTokens.RemoveRange(old);

        var plainToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32))
            .Replace('+', '-').Replace('/', '_').TrimEnd('=');

        var tokenHash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(plainToken)));

        _db.PasswordResetTokens.Add(new PasswordResetToken
        {
            UserId = user.Id,
            TokenHash = tokenHash,
            ExpiresAt = DateTime.UtcNow.AddMinutes(30),
        });
        await _db.SaveChangesAsync();

        return (true, plainToken);
    }

    public async Task<bool> ResetPasswordAsync(ResetPasswordDto dto)
    {
        var tokenHash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(dto.Token)));

        var record = await _db.PasswordResetTokens
            .Include(t => t.User)
            .FirstOrDefaultAsync(t => t.TokenHash == tokenHash && !t.IsUsed);

        if (record is null || record.ExpiresAt < DateTime.UtcNow)
            return false;

        record.User.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        record.User.UpdatedAt = DateTime.UtcNow;
        record.IsUsed = true;
        await _db.SaveChangesAsync();
        return true;
    }
}
