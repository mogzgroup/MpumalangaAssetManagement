using MAM.DataAccess.Interfaces;
using MAM.DataAccess.Tables;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace MAM.DataAccess.Repositories
{
    public class FaultRepository : IFault, IDisposable
    {
        // No unmanaged resources to dispose; provide no-op Dispose for using() pattern
        public void Dispose() { }
        private string _connectionString { get; set; }

        public FaultRepository(string connectionString)
        {
            _connectionString = connectionString;
        }

        public int AddFault(Fault fault)
        {
            using (var db = new DataContext(_connectionString))
            {
                db.Faults.Add(fault);
                db.SaveChanges();
                return fault.Id;
            }
        }

        public void AddFaults(List<Fault> faults)
        {
            if (faults == null || faults.Count == 0)
                return;
            using (var db = new DataContext(_connectionString))
            {
                db.Faults.AddRange(faults);
                db.SaveChanges();
            }
        }

        public void UpdateFault(Fault fault)
        {
            using (var db = new DataContext(_connectionString))
            {
                db.Faults.Update(fault);
                db.SaveChanges();
            }
        }

        public List<Fault> GetFaults()
        {
            using (var db = new DataContext(_connectionString))
            {
                return db.Faults.Where(f => f.IsDeleted == false)
                    .Include(a => a.FaultNotes)
                    .Include(a => a.Facility).ToList();
            }
        }

        public Fault GetFaultById(int id)
        {
            using (var db = new DataContext(_connectionString))
            {
                return db.Faults.FirstOrDefault(b => b.Id == id);
            }
        }

        public Fault GetFaultByReferenceNo(string referenceNo)
        {
            using (var db = new DataContext(_connectionString))
            {
                return db.Faults.FirstOrDefault(b => b.ReferenceNo == referenceNo);
            }
        }

        // Dispose implemented as no-op above
    }
}
