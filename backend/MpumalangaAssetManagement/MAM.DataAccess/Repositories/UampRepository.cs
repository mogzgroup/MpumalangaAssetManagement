using MAM.DataAccess.Interfaces;
using MAM.DataAccess.Tables;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace MAM.DataAccess.Repositories
{
    public class UampRepository : IUampRepository, IDisposable
    {
        // No unmanaged resources; provide no-op Dispose for callers that use 'using'
        public void Dispose() { }

        private string _connectionString { get; set; }

        public UampRepository(string connectionString)
        {
            _connectionString = connectionString;
        }

        public int CreateUamp(UserImmovableAssetManagementPlan userImmovableAssetManagementPlan)
        {
            using (var db = new DataContext(_connectionString))
            {
                db.UserImmovableAssetManagementPlans.Add(userImmovableAssetManagementPlan);
                db.SaveChanges();
                return userImmovableAssetManagementPlan.Id;
            }
        }

        public void UpdateUamp(UserImmovableAssetManagementPlan userImmovableAssetManagementPlan)
        {
            using (var db = new DataContext(_connectionString))
            {
                db.UserImmovableAssetManagementPlans.Update(userImmovableAssetManagementPlan);
                db.SaveChanges();
            }
        }

        public void DeleteUamp(UserImmovableAssetManagementPlan userImmovableAssetManagementPlan)
        {
            using (var db = new DataContext(_connectionString))
            {
                userImmovableAssetManagementPlan.Status = "Deleted";
                db.UserImmovableAssetManagementPlans.Update(userImmovableAssetManagementPlan);
                db.SaveChanges();
            }
        }

        public List<UserImmovableAssetManagementPlan> GetUamps(string department)
        {
            using (var db = new DataContext(_connectionString))
            {
                var list = db.UserImmovableAssetManagementPlans.Where(f => f.Status.ToLower() != "deleted" && f.Department.ToLower().Trim() == department.ToLower().Trim())
                    .Include(u => u.User)                    
                    .ToList();
                return list;
            }
        }

        public UserImmovableAssetManagementPlan GetUampWithTemplateOne(int id)
        {
            using (var db = new DataContext(_connectionString))
            {
                var userImmovableAssetManagementPlan = db.UserImmovableAssetManagementPlans.Where(f => f.Id == id && f.Status.ToLower() != "deleted")
                    .Include(u => u.User)
                    .Include(u => u.Programmes)
                    .Include(u => u.OptimalSupportingAccommodation);
                return userImmovableAssetManagementPlan.FirstOrDefault();
            }
        }

        public UserImmovableAssetManagementPlan GetUamp(int id)
        {
            using (var db = new DataContext(_connectionString))
            {
                var userImmovableAssetManagementPlan = db.UserImmovableAssetManagementPlans.Where(f => f.Id == id && f.Status.ToLower() != "deleted")
                    .Include(u => u.User)
                    .Include(a => a.Properties)
                    .Include(f => f.OperationPlans)
                    .Include(a => a.AcquisitionPlans)
                    .Include(u => u.Programmes)
                    .Include(u => u.OptimalSupportingAccommodation)
                    .Include(a => a.MtefBudgetPeriods)
                    .Include(a => a.SurrenderPlans)
                    .Include(a => a.StrategicAssessments);
                return userImmovableAssetManagementPlan.FirstOrDefault();
            }
        }

        // Dispose implemented as no-op above
    }
}
