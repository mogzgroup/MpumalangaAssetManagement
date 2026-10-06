using System.Collections.Generic;
using MAM.BusinessLayer.Models;
using MAM.BusinessLayer.Models.Templetes;

namespace MAM.BusinessLayer.Interfaces
{
    public interface IUserImmovableAssetManagementPlanRepository
    {
        List<UserImmovableAssetManagementPlan> GetUserImmovableAssetManagementPlans(string department);
        UserImmovableAssetManagementPlan GetUamp(int id);
        UserImmovableAssetManagementPlan GetUampWithTemplateOne(int id);
        UserImmovableAssetManagementPlan SaveUserImmovableAssetManagementPlan(UserImmovableAssetManagementPlan uamp);
        UserImmovableAssetManagementPlan StartUserImmovableAssetManagementPlan(UserImmovableAssetManagementPlan uamp);
        TempleteOne GetUAMPTempleteOne(int uampId);
        TempleteTwoPointOne GetUAMPTempleteTwoPointOne(int uampId);
        TempleteTwoPointTwo GetUAMPTempleteTwoPointTwo(int uampId);
        TempleteThree GetUAMPTempleteThree(int uampId);
        TempleteFourPointOne GetUAMPTempleteFourPointOne(int uampId);
        TempleteFourPointTwo GetUAMPTempleteFourPointTwo(int uampId);
        TempleteFivePointOne GetUAMPTempleteFivePointOne(int uampId);
        TempleteFivePointTwo GetUAMPTempleteFivePointTwo(int uampId);
        TempleteFivePointThree GetUAMPTempleteFivePointThree(int uampId);
        TempleteSix GetUAMPTempleteSix(int uampId);
        TempleteSeven GetUAMPTempleteSeven(int uampId);
        bool DeleteOperationPlan(OperationPlan operationPlan);
        bool DeleteProgramme(Programme programme);
        bool DeleteAcquisitionPlan(AcquisitionPlan acquisitionPlan);
        bool DeleteProperty(Property property);
        bool DeleteStrategicAssessment(StrategicAssessment strategicAssessment);
        bool DeleteSurrenderPlan(SurrenderPlan surrenderPlan);
    }
}
