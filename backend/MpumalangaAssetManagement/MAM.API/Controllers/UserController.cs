using System;
using System.Collections.Generic;
using log4net;
using MAM.API.Services;
using MAM.BusinessLayer.Model;
using MAM.BusinessLayer.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MAM.API.Controllers
{
    [Route("api/user")]
    [ApiController]
    public class UserController : BaseController
    {
        private static readonly ILog log = LogManager.GetLogger(typeof(UserController));

        private IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [AllowAnonymous]
        [HttpPost]
        [Route("authenticate")]
        public IActionResult Authenticate([FromBody]AuthenticateModel model)
        {
            try
            {
                var user = _userService.Authenticate(model.Username, model.Password);

                if (user == null)
                    return BadRequest(new { message = "Username or password is incorrect" });

                return Ok(user);
            }
            catch (Exception ex)
            {
                // Ensure the exception is visible in systemd/journalctl in addition to log4net DB appender
                try { Console.Error.WriteLine(ex.ToString()); } catch { }
                try { log.Error("Authenticate error", ex); } catch { }
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpGet]
        [Route("getall")]
        public IActionResult GetAll()
        {
            List<User> users = _userService.GetAll();
            return Ok(users);
        }

        [HttpPost]
        [Route("adduser")]
        public IActionResult AddUser([FromBody]User user)
        {
            User newuser = _userService.AddUser(user);
            return Ok(newuser);
        }

        [HttpPost]
        [Route("updateUser")]
        public IActionResult UpdateUser([FromBody]User user)
        {
            bool isUpdated = _userService.UpdateUser(user);
            return Ok(isUpdated);
        }

        [AllowAnonymous]
        [HttpGet]
        [Route("login/{username}/{password}")]
        public IActionResult Login(string username, string password)
        {
            try
            {
                User user = _userService.Authenticate(username, password);
                if (user == null)
                    return BadRequest(new { message = "Username or password is incorrect" });

                return Ok(user);
            }
            catch (Exception ex)
            {
                try { Console.Error.WriteLine(ex.ToString()); } catch { }
                try { log.Error("Login error", ex); } catch { }
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpGet]
        [Route("resetpassword/{username}/{password}")]
        public IActionResult ResetPassword(string username, string password)
        {
            bool isReset = _userService.ResetPassword(username, password);
            return Ok(isReset);
        }

        [HttpPost]
        [Route("resetpassword")]
        public IActionResult ResetPassword([FromBody] AuthenticateModel model)
        {
            bool isReset = _userService.ResetPassword(model.Username, model.Password);
            return Ok(isReset);
        }

        [HttpGet]
        [Route("forgotpassword/{username}/{password}")]
        public IActionResult ForgotPassword(string username, string password)
        {
            bool isReset = _userService.ForgotPassword(username, password);
            return Ok(isReset);
        }

        [HttpPost]
        [Route("forgotpassword")]
        public IActionResult ForgotPassword([FromBody] AuthenticateModel model)
        {
            bool isReset = _userService.ForgotPassword(model.Username, model.Password);
            return Ok(isReset);
        }

        [HttpGet]
        [Route("changepassword/{username}/{newPassword}/{oldPassword}")]
        public IActionResult ChangePassword(string username, string newPassword, string oldPassword)
        {
            bool isChanged = _userService.ChangePassword(username, newPassword, oldPassword);
            if (!isChanged)
                return BadRequest(new { message = "Old password is incorrect" });
            return Ok(isChanged);
        }

        [HttpPost]
        [Route("changepassword")]
        public IActionResult ChangePassword([FromBody] PasswordChangeModel model)
        {
            bool isChanged = _userService.ChangePassword(
                model.Username,
                model.NewPassword,
                model.OldPassword);
            if (!isChanged)
                return BadRequest(new { message = "Old password is incorrect" });
            return Ok(isChanged);
        }

        [HttpPost]
        [Route("deleteUser")]
        public IActionResult DeletUser([FromBody] User user)
        {
            bool isUpdated = _userService.DeleteUser(user);
            return Ok(isUpdated);
        }
    }
}