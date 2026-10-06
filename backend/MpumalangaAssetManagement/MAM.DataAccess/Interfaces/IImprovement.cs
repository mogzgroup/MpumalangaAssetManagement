using MAM.DataAccess.Tables;
using System;
using System.Collections.Generic;

namespace MAM.DataAccess.Interfaces
{
    public interface IImprovement
    {
        int AddImprovement(Improvement improvement);
        void UpdateImprovement(Improvement improvement);
        List<Improvement> GetImprovements();
        Improvement GetImprovementById(int id);
        List<Improvement> GetImprovementsByFacilityId(int facilityId);
    }
}
