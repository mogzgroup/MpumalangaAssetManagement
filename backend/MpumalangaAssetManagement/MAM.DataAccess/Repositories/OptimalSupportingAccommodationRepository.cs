using MAM.DataAccess.Interfaces;
using MAM.DataAccess.Tables;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace MAM.DataAccess.Repositories
{
    public class OptimalSupportingAccommodationRepository : IOptimalSupportingAccommodationRepository, IDisposable
    {
        // No unmanaged resources; provide no-op Dispose for callers that use 'using'
        public void Dispose() { }

        private string _connectionString { get; set; }

        public OptimalSupportingAccommodationRepository(string connectionString)
        {
            _connectionString = connectionString;
        }
        public int AddOptimalSupportingAccommodation(OptimalSupportingAccommodation optimalSupportingAccommodation)
        {
            using (var db = new DataContext(_connectionString))
            {
                db.OptimalSupportingAccommodations.Add(optimalSupportingAccommodation);
                db.SaveChanges();
                return optimalSupportingAccommodation.Id;
            }
        }

        public void DeleteOptimalSupportingAccommodation(OptimalSupportingAccommodation optimalSupportingAccommodation)
        {
            using (var db = new DataContext(_connectionString))
            {
                db.OptimalSupportingAccommodations.Remove(optimalSupportingAccommodation);
                db.SaveChanges();
            }
        }

        public OptimalSupportingAccommodation GetOptimalSupportingAccommodation(int id)
        {
            using (var db = new DataContext(_connectionString))
            {
                return db.OptimalSupportingAccommodations.Find(id);
            }
        }

        public void UpdateOptimalSupportingAccommodation(OptimalSupportingAccommodation optimalSupportingAccommodation)
        {
            using (var db = new DataContext(_connectionString))
            {
                db.OptimalSupportingAccommodations.Update(optimalSupportingAccommodation);
                db.SaveChanges();
            }
        }

        // Dispose implemented as no-op above
    }
}
