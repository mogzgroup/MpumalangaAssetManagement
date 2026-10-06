using MAM.DataAccess.Interfaces;
using MAM.DataAccess.Tables;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace MAM.DataAccess.Repositories
{
    public class AcquisitionPlanRepository : IAcquisitionPlanRepository, IDisposable
    {
        public void Dispose() { }

        private string _connectionString { get; set; }

        public AcquisitionPlanRepository(string connectionString)
        {
            _connectionString = connectionString;
        }

        public int AddAcquisitionPlan(AcquisitionPlan acquisitionPlan)
        {
            using (var db = new DataContext(_connectionString))
            {
                db.AcquisitionPlans.Add(acquisitionPlan);
                db.SaveChanges();
                return acquisitionPlan.Id;
            }
        }

        public void AddAcquisitionPlans(List<AcquisitionPlan> acquisitionPlans)
        {
            if (acquisitionPlans == null || acquisitionPlans.Count == 0)
                return;
            using (var db = new DataContext(_connectionString))
            {
                db.AcquisitionPlans.AddRange(acquisitionPlans);
                db.SaveChanges();
            }
        }

        public void UpdateAcquisitionPlan(AcquisitionPlan acquisitionPlan)
        {
            using (var db = new DataContext(_connectionString))
            {
                db.AcquisitionPlans.Update(acquisitionPlan);
                db.SaveChanges();
            }
        }

        public void DeleteAcquisitionPlan(AcquisitionPlan acquisitionPlan)
        {
            using (var db = new DataContext(_connectionString))
            {
                db.AcquisitionPlans.Remove(acquisitionPlan);
                db.SaveChanges();
            }
        }

        public List<AcquisitionPlan> GetAcquisitionPlans(int uampId)
        {
            using (var db = new DataContext(_connectionString))
            {
                var list = db.AcquisitionPlans.Where(s => s.UserImmovableAssetManagementPlanId == uampId).ToList();
                return list;
            }
        }

        public List<AcquisitionPlan> GetAcquisitionPlans(int uampId, double templateNumber)
        {
            using (var db = new DataContext(_connectionString))
            {
                var list = db.AcquisitionPlans.Where(s => s.UserImmovableAssetManagementPlanId == uampId && s.TempleteNumber == templateNumber).ToList();
                return list;
            }
        }

        // Repository uses scoped DbContext; no unmanaged handles to dispose here.
    }
}
