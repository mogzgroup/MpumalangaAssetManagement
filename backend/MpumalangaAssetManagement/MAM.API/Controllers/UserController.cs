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
            SetLog4NetConfiguration();
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
                log.Error(ex);
                throw ex;
            }
        }

        [HttpGet]
        [Route("getall")]
        public IActionResult GetAll()
        {
            try
            {
                List<User> users = _userService.GetAll();
                return Ok(users);
            }
            catch (Exception ex)
            {
                log.Error(ex);                
                throw ex;
            }
        }

        [HttpPost]
        [Route("adduser")]
        public IActionResult AddUser([FromBody]User user)
        {
            try
            {
                User newuser = _userService.AddUser(user);
                return Ok(newuser);
            }
            catch (Exception ex)
            {
                log.Error(ex);
                throw ex;
            }
        }

        [HttpPost]
        [Route("updateUser")]
        public IActionResult UpdateUser([FromBody]User user)
        {
            try
            {
                bool isUpdated = _userService.UpdateUser(user);
                return Ok(isUpdated);
            }
            catch (Exception ex)
            {
                log.Error(ex);
                throw ex;
            }
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
                log.Error(ex);
                throw ex;
            }
        }

        [HttpGet]
        [Route("resetpassword/{username}/{password}")]
        public IActionResult ResetPassword(string username, string password)
        {
            try
            {
                bool isReset = _userService.ResetPassword(username, password);
                return Ok(isReset);
            }
            catch (Exception ex)
            {
                log.Error(ex);
                throw ex;
            }
        }

        [HttpGet]
        [Route("forgotpassword/{username}/{password}")]
        public IActionResult ForgotPassword(string username, string password)
        {
            try
            {
                bool isReset = _userService.ForgotPassword(username, password);
                return Ok(isReset);
            }
            catch (Exception ex)
            {
                log.Error(ex);
                throw ex;
            }
        }

        [HttpGet]
        [Route("changepassword/{username}/{newPassword}/{oldPassword}")]
        public IActionResult ChangePassword(string username, string newPassword, string oldPassword)
        {
            try
            {
                bool isChanged = _userService.ChangePassword(username, newPassword, oldPassword);
                if (!isChanged)
                    return BadRequest(new { message = "Old password is incorrect" });
                return Ok(isChanged);
            }
            catch (Exception ex)
            {
                log.Error(ex);
                throw ex;
            }            
        }

        [HttpPost]
        [Route("deleteUser")]
        public IActionResult DeletUser([FromBody] User user)
        {
            try
            {
                bool isUpdated = _userService.DeleteUser(user);
                return Ok(isUpdated);
            }
            catch (Exception ex)
            {
                log.Error(ex);
                throw ex;
            }
        }
    }
}