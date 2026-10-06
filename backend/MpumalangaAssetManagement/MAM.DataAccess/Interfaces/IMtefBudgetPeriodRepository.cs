using MAM.DataAccess.Tables;
using System;
using System.Collections.Generic;

namespace MAM.DataAccess.Interfaces
{
    public interface IMtefBudgetPeriodRepository
    {
        int AddMtefBudgetPeriod(MtefBudgetPeriod mtefBudgetPeriod);
        void DeleteMtefBudgetPeriod(MtefBudgetPeriod mtefBudgetPeriod);
        void UpdateMtefBudgetPeriod(MtefBudgetPeriod mtefBudgetPeriod);
        List<MtefBudgetPeriod> GetMtefBudgetPeriods(int uampId);
    }
}
