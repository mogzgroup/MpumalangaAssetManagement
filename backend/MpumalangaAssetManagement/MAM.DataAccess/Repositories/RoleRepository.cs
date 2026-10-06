using MAM.DataAccess.Interfaces;
using MAM.DataAccess.Tables;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace MAM.DataAccess.Repositories
{
    public class RoleRepository : IRole, IDisposable
    {
        // No unmanaged resources; provide no-op Dispose for callers that use 'using'
        public void Dispose() { }

        private string _connectionString { get; set; }

        public RoleRepository(string connectionString)
        {
            _connectionString = connectionString;
        }

        public void AddRole(Role role)
        {
            using (var db = new DataContext(_connectionString))
            {
                db.Roles.Add(role);
                db.SaveChanges();
            }
        }

        public void UpdateRole(Role role)
        {
            using (var db = new DataContext(_connectionString))
            {
                db.Roles.Update(role);
                db.SaveChanges();
            }
        }

        public List<Role> GetRoles()
        {
            using (var db = new DataContext(_connectionString))
            {
                return db.Roles.ToList();
            }
        }

        public Role GetRoleById(int id)
        {
            using (var db = new DataContext(_connectionString))
            {
                return db.Roles.FirstOrDefault(b => b.Id == id);
            }
        }

        // Dispose implemented as no-op above
    }
}
