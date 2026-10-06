using MAM.DataAccess.Tables;
using System;
using System.Collections.Generic;

namespace MAM.DataAccess.Interfaces
{
    public interface ILandUseManagementDetailRepository
    {
        LandUseManagementDetail GetLandUseManagementDetailById(int id);
        void SetLandUseManagementDetailIncomeLeaseStatus(LandUseManagementDetail landUseManagementDetail);
    }
}
