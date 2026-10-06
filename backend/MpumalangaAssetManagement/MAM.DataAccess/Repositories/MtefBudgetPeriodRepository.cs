using MAM.DataAccess.Interfaces;
using MAM.DataAccess.Tables;
using System;
using System.Collections.Generic;
using System.Linq;

namespace MAM.DataAccess.Repositories
{
    public class MtefBudgetPeriodRepository : IMtefBudgetPeriodRepository, IDisposable
    {
        // No unmanaged resources; provide no-op Dispose for callers that use 'using'
        public void Dispose() { }

        private string _connectionString { get; set; }

        public MtefBudgetPeriodRepository(string connectionString)
        {
            _connectionString = connectionString;
        }

        public int AddMtefBudgetPeriod(MtefBudgetPeriod mtefBudgetPeriod)
        {
            using (var db = new DataContext(_connectionString))
            {
                db.MtefBudgetPeriods.Add(mtefBudgetPeriod);
                db.SaveChanges();
                return mtefBudgetPeriod.Id;
            }
        }

        public void DeleteMtefBudgetPeriod(MtefBudgetPeriod mtefBudgetPeriod)
        {
            using (var db = new DataContext(_connectionString))
            {
                db.MtefBudgetPeriods.Remove(mtefBudgetPeriod);
                db.SaveChanges();
            }
        }

        public void UpdateMtefBudgetPeriod(MtefBudgetPeriod mtefBudgetPeriod)
        {
            using (var db = new DataContext(_connectionString))
            {
                db.MtefBudgetPeriods.Update(mtefBudgetPeriod);
                db.SaveChanges();
            }
        }

        public List<MtefBudgetPeriod> GetMtefBudgetPeriods(int uampId)
        {
            using (var db = new DataContext(_connectionString))
            {
                return db.MtefBudgetPeriods.Where(m => m.UserImmovableAssetManagementPlanId == uampId).ToList();
            }
        }

        // Dispose implemented as no-op above
    }
}
