using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using Xunit;

namespace MAM.API.Tests.Security
{
    public class JwtAuthenticationTests
    {
        private readonly string _secret = "test-secret-should-be-long-enough-to-meet-requirements-123456";
        private readonly string _issuer = "MobileCentric";
        private readonly string _audience = "MobileCentricAPI";

        [Fact]
        public void ValidToken_IsValidated()
        {
            var token = CreateToken(_secret, _issuer, _audience, DateTime.UtcNow.AddMinutes(30));

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_secret);
            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = true,
                ValidIssuer = _issuer,
                ValidateAudience = true,
                ValidAudience = _audience,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            };

            var principal = tokenHandler.ValidateToken(token, validationParameters, out var validatedToken);
            Assert.NotNull(principal);
        }

        [Fact]
        public void InvalidSignature_Throws()
        {
            // Use a sufficiently long wrong secret so token creation does not throw on key size
            var token = CreateToken("wrong-secret-should-be-long-enough-1234567890", _issuer, _audience, DateTime.UtcNow.AddMinutes(30));

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_secret);
            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = true,
                ValidIssuer = _issuer,
                ValidateAudience = true,
                ValidAudience = _audience,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            };

            // The concrete exception type can vary by platform/version (SignatureKeyNotFound vs InvalidSignature).
            // Use ThrowsAny so derived IdentityModel exception types are accepted.
            Assert.ThrowsAny<SecurityTokenException>(() => tokenHandler.ValidateToken(token, validationParameters, out _));
        }

        [Fact]
        public void ExpiredToken_Throws()
        {
            var token = CreateToken(_secret, _issuer, _audience, DateTime.UtcNow.AddMinutes(-10));

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_secret);
            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = true,
                ValidIssuer = _issuer,
                ValidateAudience = true,
                ValidAudience = _audience,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            };

            Assert.Throws<SecurityTokenExpiredException>(() => tokenHandler.ValidateToken(token, validationParameters, out _));
        }

        [Fact]
        public void IncorrectIssuer_Throws()
        {
            var token = CreateToken(_secret, "bad-issuer", _audience, DateTime.UtcNow.AddMinutes(30));

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_secret);
            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = true,
                ValidIssuer = _issuer,
                ValidateAudience = true,
                ValidAudience = _audience,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            };

            Assert.Throws<SecurityTokenInvalidIssuerException>(() => tokenHandler.ValidateToken(token, validationParameters, out _));
        }

        [Fact]
        public void IncorrectAudience_Throws()
        {
            var token = CreateToken(_secret, _issuer, "bad-audience", DateTime.UtcNow.AddMinutes(30));

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_secret);
            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = true,
                ValidIssuer = _issuer,
                ValidateAudience = true,
                ValidAudience = _audience,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            };

            Assert.Throws<SecurityTokenInvalidAudienceException>(() => tokenHandler.ValidateToken(token, validationParameters, out _));
        }

        private string CreateToken(string secret, string issuer, string audience, DateTime expires)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(secret);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Issuer = issuer,
                Audience = audience,
                Subject = new ClaimsIdentity(new[] { new Claim(ClaimTypes.Name, "1") }),
                Expires = expires,
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}
