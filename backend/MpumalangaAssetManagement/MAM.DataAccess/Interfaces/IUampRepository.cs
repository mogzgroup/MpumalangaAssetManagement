using MAM.DataAccess.Tables;
using System;
using System.Collections.Generic;

namespace MAM.DataAccess.Interfaces
{
    public interface IUampRepository
    {
        int CreateUamp(UserImmovableAssetManagementPlan userImmovableAssetManagementPlan);
        void UpdateUamp(UserImmovableAssetManagementPlan userImmovableAssetManagementPlan);
        void DeleteUamp(UserImmovableAssetManagementPlan userImmovableAssetManagementPlan);
        List<UserImmovableAssetManagementPlan> GetUamps(string department);
        UserImmovableAssetManagementPlan GetUamp(int id);
        UserImmovableAssetManagementPlan GetUampWithTemplateOne(int id);
    }
}
