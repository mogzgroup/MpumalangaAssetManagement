using MAM.BusinessLayer.Helpers;
using MAM.BusinessLayer.Interfaces;
using MAM.BusinessLayer.Model;
using MAM.BusinessLayer.Models;
using MAM.BusinessLayer.Repositories;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace MAM.API.Services
{
    public interface IUserService
    {
        User Authenticate(string username, string password);
        List<User> GetAll();
        bool ChangePassword(string username, string newPassword, string oldPassword);
        bool ResetPassword(string username, string newPassword);
        bool UpdateUser(User user);
        bool DeleteUser(User user);
        User AddUser(User user);
        bool ForgotPassword(string username, string newPassword);
    }

    public class UserService : IUserService
    {
        private readonly AppSettings _appSettings;
        private readonly IUserRepository _userRepository;

        public UserService(IOptions<AppSettings> appSettings, IUserRepository userRepository)
        {
            _appSettings = appSettings.Value;
            _userRepository = userRepository;
        }

        public User Authenticate(string username, string password)
        {
            var user = _userRepository.Login(username, password);

            // return null if user not found
            if (user == null)
                return null;

            // authentication successful so generate jwt token
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_appSettings.Secret);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Issuer = _appSettings.JwtIssuer,
                Audience = _appSettings.JwtAudience,
                Subject = new ClaimsIdentity(new Claim[]
                {
                new Claim(ClaimTypes.Name, user.Id.ToString())
                }),
                Expires = DateTime.UtcNow.AddDays(7),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            user.Token = tokenHandler.WriteToken(token);

            return user.WithoutPassword();
        }

        public List<User> GetAll()
        {
            return _userRepository.GetUsers();
        }

        public bool ChangePassword(string username, string newPassword, string oldPassword)
        {
            return _userRepository.ChangePassword(username, newPassword, oldPassword);
        }

        public bool ResetPassword(string username, string newPassword) => _userRepository.ResetPassword(username, newPassword);

        public bool ForgotPassword(string username, string newPassword) => _userRepository.ForgotPassword(username, newPassword);

        public bool UpdateUser(User user) => _userRepository.UpdateUser(user);

        public bool DeleteUser(User user) => _userRepository.DeleteUser(user);

        public User AddUser(User user) => _userRepository.AddUser(user);

    }
}
