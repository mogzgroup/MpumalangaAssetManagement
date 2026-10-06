using MAM.DataAccess.Interfaces;
using MAM.DataAccess.Tables;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace MAM.DataAccess.Repositories
{
    public class ConditionAssessmentRepository : IConditionAssessment, IDisposable
    {
        // No unmanaged resources; provide no-op Dispose for callers that use 'using'
        public void Dispose() { }

        private string _connectionString { get; set; }

        public ConditionAssessmentRepository(string connectionString)
        {
            _connectionString = connectionString;
        }

        public int AddConditionAssessment(ConditionAssessment conditionAssessment)
        {
            using (var db = new DataContext(_connectionString))
            {
                db.ConditionAssessments.Add(conditionAssessment);
                db.SaveChanges();
                return conditionAssessment.Id;
            }
        }

        public void DeleteConditionAssessment(int id)
        {
            using (var db = new DataContext(_connectionString))
            {
                ConditionAssessment conditionAssessment = db.ConditionAssessments.FirstOrDefault(b => b.Id == id); 
                db.ConditionAssessments.Remove(conditionAssessment);
                db.SaveChanges();
            }
        }

        public ConditionAssessment GetConditionAssessmentById(int id)
        {
            using (var db = new DataContext(_connectionString))
            {
                return db.ConditionAssessments.FirstOrDefault(b => b.Id == id);
            }
        }

        public List<ConditionAssessment> GetConditionAssessments(int facilityId)
        {
            using (var db = new DataContext(_connectionString))
            {
                return db.ConditionAssessments.Where(b => b.FacilityId == facilityId).Include(a => a.User).ToList();
            }
        }

        // Dispose implemented as no-op above
    }
}
