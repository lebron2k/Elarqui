using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _config;

    public AuthController(IConfiguration config)
    {
        _config = config;
    }

    [HttpPost("login")]
    public IActionResult Login(UserLogin login)
    {
        // Usuarios fijos definidos en appsettings.json
        var userSection = _config.GetSection($"Usuarios:{login.Username}");
        if (!userSection.Exists()) return Unauthorized();

        var password = userSection["password"];
        var rol = userSection["rol"];

        if (login.Password != password) return Unauthorized();

        // Claims con rol
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, login.Username),
            new Claim(ClaimTypes.Role, rol)
        };

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.Now.AddMinutes(30),
            signingCredentials: creds);

        return Ok(new { token = new JwtSecurityTokenHandler().WriteToken(token) });
    }
}

// Modelo para login
public class UserLogin
{
    public string Username { get; set; }
    public string Password { get; set; }
}//
