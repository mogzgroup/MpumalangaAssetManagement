using MAM.BusinessLayer.Model;
using MAM.BusinessLayer.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace MAM.BusinessLayer.Interfaces
{
    public interface IUserRepository
    {
        User AddUser(User user);
        bool UpdateUser(User user);
        bool DeleteUser(User user);
        List<User> GetUsers();
        User Login(string username, string password);
        bool ResetPassword(string username, string adminPassword);
        bool ForgotPassword(string username, string adminPassword);
        bool ChangePassword(string username, string newPassword, string oldPassword);
    }
}
