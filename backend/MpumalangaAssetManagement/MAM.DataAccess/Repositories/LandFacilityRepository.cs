using MAM.DataAccess.Interfaces;
using MAM.DataAccess.Tables;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace MAM.DataAccess.Repositories
{
    public class LandFacilityRepository : IDisposable
    {
        // No unmanaged resources; provide no-op Dispose for callers that use 'using'
        public void Dispose() { }

        private string _connectionString { get; set; }

        public LandFacilityRepository(string connectionString)
        {
            _connectionString = connectionString;
        }        

        public int AddLandFacility(LandFacility landFacility)
        {
            using (var db = new DataContext(_connectionString))
            {
                db.LandFacilities.Add(landFacility);
                db.SaveChanges();
                return landFacility.Id;
            }
        }

        public void UpdateLandFacility(LandFacility landFacility)
        {
            using (var db = new DataContext(_connectionString))
            {
                db.LandFacilities.Update(landFacility);
                db.SaveChanges();
            }
        }

        public List<LandFacility> GetLandFacilities()
        {
            using (var db = new DataContext(_connectionString))
            {
                return db.LandFacilities.Where(f => f.Status != 0).ToList();
            }
        }

        public LandFacility GetLandFacilityById(int id)
        {
            using (var db = new DataContext(_connectionString))
            {
                return db.LandFacilities.FirstOrDefault(b => b.Id == id);
            }
        }

        public List<LandFacility> GetLandFacilities(string clientCode)
        {
            using (var db = new DataContext(_connectionString))
            {
                return db.LandFacilities.Where(b => b.ClientCode.ToLower() == clientCode.ToLower()).ToList();
            }
        }


    }
}
