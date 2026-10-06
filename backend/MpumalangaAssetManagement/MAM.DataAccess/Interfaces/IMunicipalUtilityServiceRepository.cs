using MAM.DataAccess.Tables;
using System;
using System.Collections.Generic;

namespace MAM.DataAccess.Interfaces
{
    public interface IMunicipalUtilityServiceRepository
    {
        int AddMunicipalUtilityService(MunicipalUtilityService municipalUtilityService);
        bool UpdateMunicipalUtilityService(MunicipalUtilityService municipalUtilityService);
        bool DeleteMunicipalUtilityService(MunicipalUtilityService municipalUtilityService);
        List<MunicipalUtilityService> GetMunicipalUtilityServices();
    }
}
