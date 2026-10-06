using MAM.DataAccess.Tables;
using System;
using System.Collections.Generic;

namespace MAM.DataAccess.Interfaces
{
    public interface IAcquisitionPlanRepository
    {
        int AddAcquisitionPlan(AcquisitionPlan acquisitionPlan);
        void AddAcquisitionPlans(List<AcquisitionPlan> acquisitionPlans);
        void UpdateAcquisitionPlan(AcquisitionPlan acquisitionPlan);
        void DeleteAcquisitionPlan(AcquisitionPlan acquisitionPlan);
        List<AcquisitionPlan> GetAcquisitionPlans(int uampId);
        List<AcquisitionPlan> GetAcquisitionPlans(int uampId, double templateNumber);
    }
}
