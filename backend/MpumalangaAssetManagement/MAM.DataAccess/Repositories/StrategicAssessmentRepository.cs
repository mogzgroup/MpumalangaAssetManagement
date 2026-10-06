using MAM.DataAccess.Interfaces;
using MAM.DataAccess.Tables;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace MAM.DataAccess.Repositories
{
    public class StrategicAssessmentRepository : IStrategicAssessmentRepository, IDisposable
    {
        // No unmanaged resources; provide no-op Dispose for callers that use 'using'
        public void Dispose() { }
        private string _connectionString { get; set; }

        public StrategicAssessmentRepository(string connectionString)
        {
            _connectionString = connectionString;
        }

        public List<StrategicAssessment> GetStrategicAssessments(int uampId)
        {
            using (var db = new DataContext(_connectionString))
            {
                var list = db.StrategicAssessments.Where(s => s.UserImmovableAssetManagementPlanId == uampId).ToList();
                return list;
            }
        }

        public int AddStrategicAssessment(StrategicAssessment strategicAssessments)
        {
            using (var db = new DataContext(_connectionString))
            {
                db.StrategicAssessments.Add(strategicAssessments);
                db.SaveChanges();
                return strategicAssessments.Id;
            }
        }

        public void AddStrategicAssessments(List<StrategicAssessment> strategicAssessments)
        {
            if (strategicAssessments == null || strategicAssessments.Count == 0)
                return;
            using (var db = new DataContext(_connectionString))
            {
                db.StrategicAssessments.AddRange(strategicAssessments);
                db.SaveChanges();
            }
        }

        public void UpdateStrategicAssessment(StrategicAssessment strategicAssessment)
        {
            using (var db = new DataContext(_connectionString))
            {
                db.StrategicAssessments.Update(strategicAssessment);
                db.SaveChanges();
            }
        }

        public void DeleteStrategicAssessment(StrategicAssessment strategicAssessments)
        {
            using (var db = new DataContext(_connectionString))
            {
                db.StrategicAssessments.Remove(strategicAssessments);
                db.SaveChanges();
            }
        }

        // Dispose implemented as no-op above
    }
}
