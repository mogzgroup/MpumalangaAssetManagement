using MAM.DataAccess.Tables;
using System;
using System.Collections.Generic;

namespace MAM.DataAccess.Interfaces
{
    public interface IOperationPlanRepository
    {
        int AddOperationPlan(OperationPlan operationPlan);
        void AddOperationPlans(List<OperationPlan> operationPlans);
        void UpdateOperationPlan(OperationPlan operationPlan);
        void DeleteOperationPlan(OperationPlan operationPlan);
        List<OperationPlan> GetOperationPlans(int uampId);
        List<OperationPlan> GetOperationPlans(int uampId, double templateNumber);
    }
}
