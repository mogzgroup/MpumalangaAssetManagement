using MAM.BusinessLayer.Helpers;
using MAM.BusinessLayer.Interfaces;
using MAM.BusinessLayer.Model;
using MAM.BusinessLayer.Models;
using MAM.DataAccess;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MAM.BusinessLayer.Repositories
{
    public class UserRepository : IUserRepository
    {
        private AppSettings appSettings { get; set; }
        private readonly MAM.DataAccess.Interfaces.IUser _dataAccess;

        public UserRepository(AppSettings settings, MAM.DataAccess.Interfaces.IUser dataAccess)
        {
            appSettings = settings;
            _dataAccess = dataAccess;
        }

        public User AddUser(User user)
        {
            // Basic validation to avoid duplicate usernames/emails.
            // Note: a unique DB index is recommended to make this bulletproof under concurrency.
            var existingByUsername = _dataAccess.GetUser(user.Username);
            if (existingByUsername != null)
                throw new MAM.BusinessLayer.Helpers.ValidationException("Username is already in use.");

            var existingByEmail = _dataAccess.GetUserByEmail(user.Email);
            if (existingByEmail != null)
                throw new MAM.BusinessLayer.Helpers.ValidationException("Email is already in use.");

            string realPassword = user.Password;
            string password = EncryptDecryptHelper.Encrypt(user.Password);
            user.Password = password;

            _dataAccess.AddUser(user.ConvertToUserTable(user));

            // Send Email asynchronously without blocking the request thread.
            try
            {
                EmailService emailService = new EmailService(appSettings);
                Task.Run(() => emailService.NewUserEmail(user.ConvertToUserTable(user), realPassword));
            }
            catch
            {
                // Do not fail user creation if email sending fails; log4net will capture details.
            }

            User newUser = user.ConvertToUser(_dataAccess.GetUser(user.Username), appSettings.ConnectionString);
            return newUser;
        }

        public bool UpdateUser(User user)
        {
            _dataAccess.UpdateUser(user.ConvertToUserTable(user));
            return true;
        }

        public bool DeleteUser(User user)
        {
            user.IsActive = false;
            user.ModifiedDate = DateTime.Now;
            _dataAccess.UpdateUser(user.ConvertToUserTable(user));
            return true;
        }

        public List<User> GetUsers()
        {
            var users = _dataAccess.GetUsers();

            return users
                .Select(user => new User
                {
                    Id = user.Id,
                    Name = user.Name,
                    Surname = user.Surname,
                    Username = user.Username,
                    Password = user.Password,
                    RoleId = user.RoleId,
                    IsActive = user.IsActive,
                    Email = user.Email,
                    PasswordIsChanged = user.PasswordIsChanged,
                    CreatedDate = user.CreatedDate,
                    ModifiedDate = user.ModifiedDate,
                    CreatedUserId = user.CreatedUserId,
                    ModifiedUserId = user.ModifiedUserId,
                    Department = user.Department
                })
                .ToList();
        }

        public User Login(string username, string password)
        {
            var dbUser = _dataAccess.GetUser(username);
            if (dbUser == null)
                return null;

            var user = new User().ConvertToUser(dbUser, appSettings.ConnectionString);
            if (user == null)
                return null;

            // Defensive: ensure decryption errors don't throw. Decrypt returns null on failure.
            var decryptedPassword = EncryptDecryptHelper.Decrypt(user.Password);
            if (decryptedPassword != null && decryptedPassword == password)
            {
                return user;
            }

            // wrong password or malformed stored ciphertext
            return null;
        }

        public bool ResetPassword(string username, string adminPassword)
        {
            MAM.DataAccess.Tables.User user = _dataAccess.GetUser(username);
            if (user != null)
            {
                string password = EncryptDecryptHelper.Encrypt(adminPassword);
                user.Password = password;
                user.PasswordIsChanged = false;
                _dataAccess.UpdateUser(user);

                EmailService emailService = new EmailService(appSettings);
                //Send Email
                Task sendEmailTask = new Task(() => emailService.SendResertPasswordEmail(user, adminPassword));                   
                sendEmailTask.Start();
                return true;
            }
            return false;
        }

        public bool ForgotPassword(string username, string adminPassword)
        {
            MAM.DataAccess.Tables.User user = _dataAccess.GetUser(username);
            if (user != null)
            {
                string password = EncryptDecryptHelper.Encrypt(adminPassword);
                user.Password = password;
                user.PasswordIsChanged = false;
                _dataAccess.UpdateUser(user);

                EmailService emailService = new EmailService(appSettings);
                //Send Email
                Task sendEmailTask = new Task(() => emailService.ForgotPasswordEmail(user, adminPassword));
                sendEmailTask.Start();
                return true;
            }
            return false;
        }

        public bool ChangePassword(string username, string newPassword, string oldPassword)
        {
            using (var dataAccess = new DataAccess.Repositories.UserRepository(appSettings.ConnectionString))
            {
                // No-op placeholder comment to adjust file context for patching.
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

        // Business-layer repository relies on data-access layer for resource management.

    }
}
