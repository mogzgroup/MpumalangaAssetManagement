using MAM.DataAccess.Tables;
using System;
using System.Collections.Generic;

namespace MAM.DataAccess.Interfaces
{
    public interface IConditionAssessment
    {
        int AddConditionAssessment(ConditionAssessment conditionAssessment);
        void DeleteConditionAssessment(int id);
        List<ConditionAssessment> GetConditionAssessments(int facilityId);
        ConditionAssessment GetConditionAssessmentById(int id);
    }
}
