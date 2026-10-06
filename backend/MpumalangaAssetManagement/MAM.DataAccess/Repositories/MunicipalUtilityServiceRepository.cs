using MAM.DataAccess.Interfaces;
using MAM.DataAccess.Tables;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace MAM.DataAccess.Repositories
{
    public class MunicipalUtilityServiceRepository : IMunicipalUtilityServiceRepository, IDisposable
    {
        // No unmanaged resources; provide no-op Dispose for callers that use 'using'
        public void Dispose() { }

        private string _connectionString { get; set; }

        public MunicipalUtilityServiceRepository(string connectionString)
        {
            _connectionString = connectionString;
        }

        public int AddMunicipalUtilityService(MunicipalUtilityService municipalUtilityService)
        {
            throw new NotImplementedException();
        }

        public bool UpdateMunicipalUtilityService(MunicipalUtilityService municipalUtilityService)
        {
            throw new NotImplementedException();
        }

        public bool DeleteMunicipalUtilityService(MunicipalUtilityService municipalUtilityService)
        {
            throw new NotImplementedException();
        }

        public List<MunicipalUtilityService> GetMunicipalUtilityServices()
        {
            throw new NotImplementedException();
        }

        // Dispose implemented as no-op above
    }
}
