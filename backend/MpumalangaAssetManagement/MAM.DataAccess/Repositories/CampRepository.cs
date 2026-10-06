using MAM.DataAccess.Interfaces;
using MAM.DataAccess.Tables;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace MAM.DataAccess.Repositories
{
    public class CampRepository : ICampRepository, IDisposable
    {
        private string _connectionString { get; set; }

        public int CreateUamp(Camp camp)
        {
            using (var db = new DataContext(_connectionString))
            {
                db.Camps.Add(camp);
                db.SaveChanges();
                return camp.Id;
            }
        }

        public List<Camp> GetCamps(string department)
        {
            using (var db = new DataContext(_connectionString))
            {
                var list = db.Camps.Where(f => f.Status.ToLower() != "deleted" && f.Department.ToLower().Trim() == department.ToLower().Trim())
                    .Include(u => u.User)
                    .ToList();
                return list;
            }
        }

        public CampRepository(string connectionString)
        {
            _connectionString = connectionString;
        }
        // No unmanaged resources to dispose; provide no-op Dispose so callers using 'using' continue to compile.
        public void Dispose() { }
    }
}
