using MAM.DataAccess.Interfaces;
using MAM.DataAccess.Tables;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace MAM.DataAccess.Repositories
{
    public class HiredPropertyRepository : IHiredPropertyRepository, IDisposable
    {
        // No unmanaged resources; provide no-op Dispose for callers that use 'using'
        public void Dispose() { }

        private string _connectionString { get; set; }

        public HiredPropertyRepository(string connectionString)
        {
            _connectionString = connectionString;
        }

        public int AddHiredProperty(HiredProperty hiredProperty)
        {
            using (var db = new DataContext(_connectionString))
            {
                db.HiredProperties.Add(hiredProperty);
                db.SaveChanges();
                return hiredProperty.Id;
            }
        }

        public void UpdateHiredProperty(HiredProperty hiredProperty)
        {
            using (var db = new DataContext(_connectionString))
            {
                db.HiredProperties.Update(hiredProperty);
                db.SaveChanges();
            }
        }

        public void DeleteHiredProperty(HiredProperty hiredProperty)
        {
            using (var db = new DataContext(_connectionString))
            {
                hiredProperty.IsDeteted = true;
                db.HiredProperties.Update(hiredProperty);
                db.SaveChanges();
            }
        }

        public List<HiredProperty> GetHiredProperties()
        {
            using (var db = new DataContext(_connectionString))
            {
                var list = db.HiredProperties.Where(s => s.IsDeteted == false).ToList();
                return list;
            }
        }

        // Dispose implemented as no-op above
    }
}
