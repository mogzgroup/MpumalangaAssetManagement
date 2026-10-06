using MAM.DataAccess.Interfaces;
using MAM.DataAccess.Tables;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace MAM.DataAccess.Repositories
{
    public class ProgrammeRepository : IProgrammeRepository, IDisposable
    {
        // No unmanaged resources; provide no-op Dispose for callers that use 'using'
        public void Dispose() { }

        private string _connectionString { get; set; }

        public ProgrammeRepository(string connectionString)
        {
            _connectionString = connectionString;
        }
        public int AddProgramme(Programme programme)
        {
            using (var db = new DataContext(_connectionString))
            {
                db.Programmes.Add(programme);
                db.SaveChanges();
                return programme.Id;
            }
        }

        public void AddProgrammes(List<Programme> programmes)
        {
            if (programmes == null || programmes.Count == 0)
                return;
            using (var db = new DataContext(_connectionString))
            {
                db.Programmes.AddRange(programmes);
                db.SaveChanges();
            }
        }

        public void DeleteProgramme(Programme programme)
        {
            using (var db = new DataContext(_connectionString))
            {
                db.Programmes.Remove(programme);
                db.SaveChanges();
            }
        }

        public List<Programme> GetProgrammes(int uampId)
        {
            using(var db = new DataContext(_connectionString))
            {
                return db.Programmes.Where(p => p.UserImmovableAssetManagementPlanId == uampId).ToList();
            }
        }

        public void UpdateProgramme(Programme programme)
        {
            using (var db = new DataContext(_connectionString))
            {
                db.Programmes.Update(programme);
                db.SaveChanges();
            }
        }

        // Dispose implemented as no-op above
    }
}
