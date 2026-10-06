using MAM.DataAccess.Interfaces;
using MAM.DataAccess.Tables;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace MAM.DataAccess.Repositories
{
    public class SurrenderPlanRepository : ISurrenderPlanRepository, IDisposable
    {
        // No unmanaged resources; provide no-op Dispose for callers that use 'using'
        public void Dispose() { }

        private string _connectionString { get; set; }

        public SurrenderPlanRepository(string connectionString)
        {
            _connectionString = connectionString;
        }
        public int AddSurrenderPlan(SurrenderPlan surrenderPlan)
        {
            using (var db = new DataContext(_connectionString))
            {
                db.SurrenderPlans.Add(surrenderPlan);
                db.SaveChanges();
                return surrenderPlan.Id;
            }
        }

        public void UpdateSurrenderPlan(SurrenderPlan surrenderPlan)
        {
            using (var db = new DataContext(_connectionString))
            {
                db.SurrenderPlans.Update(surrenderPlan);
                db.SaveChanges();
            }
        }

        public void DeleteSurrenderPlan(SurrenderPlan surrenderPlan)
        {
            using (var db = new DataContext(_connectionString))
            {
                db.SurrenderPlans.Remove(surrenderPlan);
                db.SaveChanges();
            }
        }

        public List<SurrenderPlan> GetSurrenderPlans(int uampId)
        {
            using (var db = new DataContext(_connectionString))
            {
                var list = db.SurrenderPlans.Where(s => s.UserImmovableAssetManagementPlanId == uampId).ToList();
                return list;
            }
        }

        // Dispose implemented as no-op above
    }
}
