using MAM.BusinessLayer.Models;
using MAM.BusinessLayer.Models.Templetes;
using MAM.BusinessLayer.Repositories;
using MAM.BusinessLayer.Interfaces;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MAM.API.Services
{
    public interface IUAMPService
    {
        List<UserImmovableAssetManagementPlan> GetUserImmovableAssetManagementPlans(string department);
        UserImmovableAssetManagementPlan GetUamp(int id);
        UserImmovableAssetManagementPlan GetUampWithTemplateOne(int id);
        UserImmovableAssetManagementPlan SaveUserImmovableAssetManagementPlan(UserImmovableAssetManagementPlan userImmovableAssetManagementPlan);
        UserImmovableAssetManagementPlan StartUserImmovableAssetManagementPlan(UserImmovableAssetManagementPlan userImmovableAssetManagementPlan);
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
    }

    public class UAMPService : IUAMPService
    {
        private readonly AppSettings _appSettings;
        private readonly MAM.BusinessLayer.Interfaces.IUserImmovableAssetManagementPlanRepository _uampRepository;

        public UAMPService(IOptions<AppSettings> appSettings, MAM.BusinessLayer.Interfaces.IUserImmovableAssetManagementPlanRepository uampRepository)
        {
            _appSettings = appSettings.Value;
            _uampRepository = uampRepository;
        }

        public bool DeleteOperationPlan(OperationPlan operationPlan)
        {
            return _uampRepository.DeleteOperationPlan(operationPlan);
        }

        public bool DeleteProgramme(Programme programme)
        {
            return _uampRepository.DeleteProgramme(programme);
        }

        public bool DeleteAcquisitionPlan(AcquisitionPlan acquisitionPlan)
        {
            return _uampRepository.DeleteAcquisitionPlan(acquisitionPlan);
        }

        public bool DeleteProperty(Property property)
        {
            return _uampRepository.DeleteProperty(property);
        }

        public bool DeleteStrategicAssessment(StrategicAssessment strategicAssessment)
        {
            return _uampRepository.DeleteStrategicAssessment(strategicAssessment);
        }

        public bool DeleteSurrenderPlan(SurrenderPlan surrenderPlan)
        {
            return _uampRepository.DeleteSurrenderPlan(surrenderPlan);
        }

        public UserImmovableAssetManagementPlan GetUamp(int id) => _uampRepository.GetUamp(id);

        public List<UserImmovableAssetManagementPlan> GetUserImmovableAssetManagementPlans(string department) => _uampRepository.GetUserImmovableAssetManagementPlans(department);

        public UserImmovableAssetManagementPlan SaveUserImmovableAssetManagementPlan(UserImmovableAssetManagementPlan userImmovableAssetManagementPlan) => _uampRepository.SaveUserImmovableAssetManagementPlan(userImmovableAssetManagementPlan);

        public UserImmovableAssetManagementPlan StartUserImmovableAssetManagementPlan(UserImmovableAssetManagementPlan userImmovableAssetManagementPlan) => _uampRepository.StartUserImmovableAssetManagementPlan(userImmovableAssetManagementPlan);

        public TempleteOne GetUAMPTempleteOne(int uampId) => _uampRepository.GetUAMPTempleteOne(uampId);
        public TempleteTwoPointOne GetUAMPTempleteTwoPointOne(int uampId) => _uampRepository.GetUAMPTempleteTwoPointOne(uampId);
        public TempleteTwoPointTwo GetUAMPTempleteTwoPointTwo(int uampId) => _uampRepository.GetUAMPTempleteTwoPointTwo(uampId);
        public TempleteThree GetUAMPTempleteThree(int uampId) => _uampRepository.GetUAMPTempleteThree(uampId);
        public TempleteFourPointOne GetUAMPTempleteFourPointOne(int uampId) => _uampRepository.GetUAMPTempleteFourPointOne(uampId);
        public TempleteFourPointTwo GetUAMPTempleteFourPointTwo(int uampId) => _uampRepository.GetUAMPTempleteFourPointTwo(uampId);
        public TempleteFivePointOne GetUAMPTempleteFivePointOne(int uampId) => _uampRepository.GetUAMPTempleteFivePointOne(uampId);
        public TempleteFivePointTwo GetUAMPTempleteFivePointTwo(int uampId) => _uampRepository.GetUAMPTempleteFivePointTwo(uampId);

        public TempleteFivePointThree GetUAMPTempleteFivePointThree(int uampId) => _uampRepository.GetUAMPTempleteFivePointThree(uampId);

        public TempleteSix GetUAMPTempleteSix(int uampId) => _uampRepository.GetUAMPTempleteSix(uampId);

        public TempleteSeven GetUAMPTempleteSeven(int uampId) => _uampRepository.GetUAMPTempleteSeven(uampId);

        public UserImmovableAssetManagementPlan GetUampWithTemplateOne(int id) => _uampRepository.GetUampWithTemplateOne(id);
    }
}
