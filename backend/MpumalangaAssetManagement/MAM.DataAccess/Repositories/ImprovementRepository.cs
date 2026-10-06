using MAM.DataAccess.Interfaces;
using MAM.DataAccess.Tables;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace MAM.DataAccess.Repositories
{
    public class ImprovementRepository : IImprovement, IDisposable
    {
        // No unmanaged resources; provide no-op Dispose for callers that use 'using'
        public void Dispose() { }

        private string _connectionString { get; set; }

        public ImprovementRepository(string connectionString)
        {
            _connectionString = connectionString;
        }

        public int AddImprovement(Improvement improvement)
        {
            using (var db = new DataContext(_connectionString))
            {
                db.Improvements.Add(improvement);
                db.SaveChanges();
                return improvement.Id;
            }
        }

        public List<Improvement> GetImprovements()
        {
            using (var db = new DataContext(_connectionString))
            {
                return db.Improvements.Select(f => f).ToList();
            }
        }

        public List<Improvement> GetImprovementsByFacilityId(int facilityId)
        {
            using (var db = new DataContext(_connectionString))
            {
                return db.Improvements.Where(b => b.FacilityId == facilityId).ToList();
            }
        }

        public Improvement GetImprovementById(int id)
        {
            using (var db = new DataContext(_connectionString))
            {
                return db.Improvements.FirstOrDefault(b => b.Id == id);
            }
        }

        public void UpdateImprovement(Improvement improvement)
        {
            using (var db = new DataContext(_connectionString))
            {
                db.Improvements.Update(improvement);
                db.SaveChanges();
            }
        }

        // Dispose implemented as no-op above
    }
}
