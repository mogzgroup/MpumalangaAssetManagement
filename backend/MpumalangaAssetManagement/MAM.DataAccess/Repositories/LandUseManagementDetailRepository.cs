using MAM.DataAccess.Interfaces;
using MAM.DataAccess.Tables;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace MAM.DataAccess.Repositories
{
    public class LandUseManagementDetailRepository : ILandUseManagementDetailRepository, IDisposable
    {
        // No unmanaged resources; provide no-op Dispose for callers that use 'using'
        public void Dispose() { }

        private string _connectionString { get; set; }

        public LandUseManagementDetailRepository(string connectionString)
        {
            _connectionString = connectionString;
        }

        #region Land

        public LandUseManagementDetail GetLandUseManagementDetailById(int id)
        {
            using (var db = new DataContext(_connectionString))
            {
                return db.LandUseManagementDetails.FirstOrDefault(b => b.Id == id);
            }
        }

        public void SetLandUseManagementDetailIncomeLeaseStatus(LandUseManagementDetail landUseManagementDetail)
        {
            using (var db = new DataContext(_connectionString))
            {
                LandUseManagementDetail _landUseManagementDetail1 = GetLandUseManagementDetailById(landUseManagementDetail.Id);
                _landUseManagementDetail1.IncomeLeaseStatus = "No";
                db.LandUseManagementDetails.Update(_landUseManagementDetail1);
                db.SaveChanges();
            }
        }

        #endregion

        // Dispose implemented as no-op above

    }
}
