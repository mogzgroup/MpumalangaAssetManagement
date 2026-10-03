using MAM.BusinessLayer.Helpers;
using MAM.BusinessLayer.Interfaces;
using MAM.BusinessLayer.Model;
using MAM.BusinessLayer.Models;
using MAM.DataAccess;
using Microsoft.Win32.SafeHandles;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;

namespace MAM.BusinessLayer.Repositories
{
    public class UserRepository : IDisposable
    {
        private AppSettings appSettings { get; set; }
        // Flag: Has Dispose already been called?
        bool disposed = false;
        // Instantiate a SafeHandle instance.
        SafeHandle handle = new SafeFileHandle(IntPtr.Zero, true);

        public UserRepository(AppSettings settings)
        {
            appSettings = settings;
        }

        public User AddUser(User user)
        {
            using (var dataAccess = new DataAccess.Repositories.UserRepository(appSettings.ConnectionString))
            {
                string realPassword = user.Password;
                string password = EncryptDecryptHelper.Encrypt(user.Password);
                user.Password = password;
                dataAccess.AddUser(user.ConvertToUserTable(user));

                //Send Email
                EmailService emailService = new EmailService(appSettings);
                Task sendEmailTask = new Task(() => emailService.NewUserEmail(user.ConvertToUserTable(user), realPassword));
                sendEmailTask.Start();

                User newUser = user.ConvertToUser(dataAccess.GetUser(user.Username), appSettings.ConnectionString);
                return newUser;
            }
        }

        public bool UpdateUser(User user)
        {
            using (var dataAccess = new DataAccess.Repositories.UserRepository(appSettings.ConnectionString))
            {
                dataAccess.UpdateUser(user.ConvertToUserTable(user));
                return true;
            }
        }

        public bool DeleteUser(User user)
        {
            using (var dataAccess = new DataAccess.Repositories.UserRepository(appSettings.ConnectionString))
            {
                user.IsActive = false;
                user.ModifiedDate = DateTime.Now;
                dataAccess.UpdateUser(user.ConvertToUserTable(user));
                return true;
            }
        }

        public List<User> GetUsers()
        {
            List<User> list = new List<User>();
            using (var dataAccess = new DataAccess.Repositories.UserRepository(appSettings.ConnectionString))
            {
               List<DataAccess.Tables.User> users = dataAccess.GetUsers();
                foreach (var user in users)
                {                    
                    User _user = new User();                 
                    _user = _user.ConvertToUser(user, appSettings.ConnectionString);
                    list.Add(_user);
                }
                return list;
            }            
        }

        public User Login(string username, string password)
        {
            using (var dataAccess = new DataAccess.Repositories.UserRepository(appSettings.ConnectionString))
            {               
                User user = new User();
                user = user.ConvertToUser(dataAccess.GetUser(username), appSettings.ConnectionString);
                if (user != null)
                {
                    string decriptedPassword = EncryptDecryptHelper.Decrypt(user.Password);
                    if (decriptedPassword == password)
                    {
                        return user;
                    }
                    return new User(); 
                }
                return new User();
            }
        }

        public bool ResetPassword(string username, string adminPassword)
        {
            using (var dataAccess = new DataAccess.Repositories.UserRepository(appSettings.ConnectionString))
            {
                MAM.DataAccess.Tables.User user = dataAccess.GetUser(username);
                if (user != null)
                {
                    string password = EncryptDecryptHelper.Encrypt(adminPassword);
                    user.Password = password;
                    user.PasswordIsChanged = false;
                    dataAccess.UpdateUser(user);

                    EmailService emailService = new EmailService(appSettings);
                    //Send Email
                    Task sendEmailTask = new Task(() => emailService.SendResertPasswordEmail(user, adminPassword));                   
                    sendEmailTask.Start();
                    return true;
                }
                return false;
            }
        }

        public bool ForgotPassword(string username, string adminPassword)
        {
            using (var dataAccess = new DataAccess.Repositories.UserRepository(appSettings.ConnectionString))
            {
                MAM.DataAccess.Tables.User user = dataAccess.GetUser(username);
                if (user != null)
                {
                    string password = EncryptDecryptHelper.Encrypt(adminPassword);
                    user.Password = password;
                    user.PasswordIsChanged = false;
                    dataAccess.UpdateUser(user);

                    EmailService emailService = new EmailService(appSettings);
                    //Send Email
                    Task sendEmailTask = new Task(() => emailService.ForgotPasswordEmail(user, adminPassword));
                    sendEmailTask.Start();
                    return true;
                }
                return false;
            }
        }

        public bool ChangePassword(string username, string newPassword, string oldPassword)
        {
            using (var dataAccess = new DataAccess.Repositories.UserRepository(appSettings.ConnectionString))
            {
                MAM.DataAccess.Tables.User user = dataAccess.GetUser(username);
                if (user != null)
                {
                    string decriptedPassword = EncryptDecryptHelper.Decrypt(user.Password);
                    if (decriptedPassword == oldPassword)
                    {
                        string password = EncryptDecryptHelper.Encrypt(newPassword);
                        user.Password = password;
                        user.PasswordIsChanged = true;

                        dataAccess.UpdateUser(user);
                        return true;
                    }
                    return false;
                }
                return false;
            }
        }

        public void Dispose()
        {
            // Dispose of unmanaged resources.
            Dispose(true);
            // Suppress finalization.
            GC.SuppressFinalize(this);
        }

        // Protected implementation of Dispose pattern.
        protected virtual void Dispose(bool disposing)
        {
            if (disposed)
                return;

            if (disposing)
            {
                handle.Dispose();
            }

            disposed = true;
        }

    }
}
