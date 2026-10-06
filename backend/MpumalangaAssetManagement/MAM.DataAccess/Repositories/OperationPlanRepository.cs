
using MAM.DataAccess.Interfaces;
using MAM.DataAccess.Tables;
using System;
using System.Collections.Generic;
using System.Linq;

namespace MAM.DataAccess.Repositories
{
    public class OperationPlanRepository : IOperationPlanRepository, IDisposable
    {
        // No unmanaged resources; provide no-op Dispose for callers that use 'using'
        public void Dispose() { }
        private string _connectionString { get; set; }

        public OperationPlanRepository(string connectionString)
        {
            _connectionString = connectionString;
        }

        public int AddOperationPlan(OperationPlan operationPlan)
        {
            using (var db = new DataContext(_connectionString))
            {
                db.OperationPlans.Add(operationPlan);
                db.SaveChanges();
                return operationPlan.Id;
            }
        }

        public void AddOperationPlans(List<OperationPlan> operationPlans)
        {
            if (operationPlans == null || operationPlans.Count == 0)
                return;
            using (var db = new DataContext(_connectionString))
            {
                db.OperationPlans.AddRange(operationPlans);
                db.SaveChanges();
            }
        }

        public void UpdateOperationPlan(OperationPlan operationPlan)
        {
            using (var db = new DataContext(_connectionString))
            {
                db.OperationPlans.Update(operationPlan);
                db.SaveChanges();
            }
        }

        public void DeleteOperationPlan(OperationPlan operationPlan)
        {
            using (var db = new DataContext(_connectionString))
            {
                db.OperationPlans.Remove(operationPlan);
                db.SaveChanges();
            }
        }

        public List<OperationPlan> GetOperationPlans(int uampId)
        {
            using (var db = new DataContext(_connectionString))
            {
                var list = db.OperationPlans.Where(s => s.UserImmovableAssetManagementPlanId == uampId).ToList();
                return list;
            }
        }

        public List<OperationPlan> GetOperationPlans(int uampId, double templateNumber)
        {
            using (var db = new DataContext(_connectionString))
            {
                var list = db.OperationPlans.Where(s => s.UserImmovableAssetManagementPlanId == uampId && s.TempleteNumber == templateNumber).ToList();
                return list;
            }
        }

        // Dispose implemented as no-op above
    }
}
