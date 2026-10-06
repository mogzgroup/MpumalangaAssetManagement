using MAM.BusinessLayer.Models;
using MAM.BusinessLayer.Interfaces;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MAM.API.Services
{
    public interface IConditionAssessmentService
    {
        List<ConditionAssessment> GetConditionAssessments(int facilityId);
        bool DeleteConditionAssessment(int id);
        int AddConditionAssessment(ConditionAssessment conditionAssessment);
    }
    public class ConditionAssessmentService : IConditionAssessmentService
    {
        private readonly AppSettings _appSettings;
        private readonly IConditionAssessmentRepository _conditionAssessmentRepository;

        public ConditionAssessmentService(IOptions<AppSettings> appSettings, IConditionAssessmentRepository conditionAssessmentRepository)
        {
            _appSettings = appSettings.Value;
            _conditionAssessmentRepository = conditionAssessmentRepository;
        }

        public int AddConditionAssessment(ConditionAssessment conditionAssessment) => _conditionAssessmentRepository.AddConditionAssessment(conditionAssessment);
        public bool DeleteConditionAssessment(int id) => _conditionAssessmentRepository.DeleteConditionAssessment(id);
        public List<ConditionAssessment> GetConditionAssessments(int facilityId) => _conditionAssessmentRepository.GetConditionAssessments(facilityId);
    }
}
