using MAM.DataAccess.Interfaces;
using MAM.DataAccess.Tables;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace MAM.DataAccess.Repositories
{
    public class UserRepository : IUser, IDisposable
    {
        // No unmanaged resources here; add no-op Dispose to allow callers to use 'using'
        public void Dispose() { }
        private string _connectionString { get; set; }

        public UserRepository(string connectionString)
        {
            _connectionString = connectionString;
        }

        public void AddUser(User user) 
        {
            using (var db = new DataContext(_connectionString))
            {
                db.Users.Add(user);
                db.SaveChanges();
            }
        }

        public void UpdateUser(User user)
        {
            using (var db = new DataContext(_connectionString))
            {
                db.Users.Update(user);
                db.SaveChanges();
            }
        }

        public List<User> GetUsers()
        {
            using (var db = new DataContext(_connectionString))
            {
                return db.Users.Where(u => u.IsActive == true).ToList();
            }
        }

        public User GetUser(string username)
        {
            using (var db = new DataContext(_connectionString))
            {
                return db.Users.FirstOrDefault(b => b.Username.ToLower() == username.ToLower());
            }
        }

        public User GetUserByEmail(string email)
        {
            using (var db = new DataContext(_connectionString))
            {
                if (string.IsNullOrWhiteSpace(email))
                    return null;

                return db.Users.FirstOrDefault(b => b.Email.ToLower() == email.ToLower());
            }
        }

        public User GetUser(int id)
        {
            using (var db = new DataContext(_connectionString))
            {
                return db.Users.Find(id);
            }
        }

        // No-op Dispose provided above; the class holds no unmanaged resources.
    }
}
