using MAM.DataAccess.Tables;
using System;
using System.Collections.Generic;

namespace MAM.DataAccess.Interfaces
{
    public interface IUser
    {
        void AddUser(User user);
        void UpdateUser(User user);
        List<User> GetUsers();
        User GetUser(string username);
        User GetUserByEmail(string email);
        User GetUser(int id);
    }
}
