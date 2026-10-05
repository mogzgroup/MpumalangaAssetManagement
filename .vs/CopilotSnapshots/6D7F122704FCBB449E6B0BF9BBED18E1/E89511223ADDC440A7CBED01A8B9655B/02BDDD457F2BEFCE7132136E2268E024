using MAM.DataAccess.Interfaces;
using MAM.DataAccess.Tables;
using Microsoft.Win32.SafeHandles;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;

namespace MAM.DataAccess.Repositories
{
    public class UserRepository : IUser , IDisposable
    {
        // Flag: Has Dispose already been called?
        bool disposed = false;
        // Instantiate a SafeHandle instance.
        SafeHandle handle = new SafeFileHandle(IntPtr.Zero, true);

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

        public User GetUser(int id)
        {
            using (var db = new DataContext(_connectionString))
            {
                return db.Users.Find(id);
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
                // Free any other managed objects here.
                //
            }

            disposed = true;
        }
    }
}
