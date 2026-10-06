using MAM.BusinessLayer.Interfaces;
using MAM.BusinessLayer.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace MAM.BusinessLayer.Repositories
{
    public class ConditionAssessmentRepository : IConditionAssessmentRepository
    {
        private AppSettings appSettings { get; set; }
        private readonly MAM.DataAccess.Interfaces.IConditionAssessment _dataAccess;

        public ConditionAssessmentRepository(AppSettings settings, MAM.DataAccess.Interfaces.IConditionAssessment dataAccess)
        {
            appSettings = settings;
            _dataAccess = dataAccess;
        }

        public int AddConditionAssessment(ConditionAssessment conditionAssessment)
        {
            return _dataAccess.AddConditionAssessment(conditionAssessment.ConvertConditionAssessment(conditionAssessment));
        }

        public bool DeleteConditionAssessment(int id)
        {
            _dataAccess.DeleteConditionAssessment(id);
            return true;
        }

        public List<ConditionAssessment> GetConditionAssessments(int facilityId)
        {
            ConditionAssessment conditionAssessment = new ConditionAssessment();
            return conditionAssessment.ConvertToConditionAssessments(_dataAccess.GetConditionAssessments(facilityId));
        }

        public ConditionAssessment GetConditionAssessmentById(int id)
        {
            ConditionAssessment conditionAssessment = new ConditionAssessment();
            return conditionAssessment.ConvertConditionAssessment(_dataAccess.GetConditionAssessmentById(id));
        }

        // Business-layer repository does not own unmanaged resources; rely on data-access layer for disposal.
    }
}
