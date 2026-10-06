using MAM.DataAccess.Interfaces;
using MAM.DataAccess.Tables;
using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Text;
using System.Linq;

namespace MAM.DataAccess.Repositories
{
    public class LeaseManegementRepository : ILeaseManegement, IDisposable
    {
        // No unmanaged resources; provide no-op Dispose for callers that use 'using'
        public void Dispose() { }

        private string _connectionString { get; set; }

        public LeaseManegementRepository(string connectionString)
        {
            _connectionString = connectionString;
        }

        public List<LeasedProperty> GetLeasedProperties()
        {
            using (var db = new DataContext(_connectionString))
            {
                var leasedProperties = (from ls in db.LeaseStatuses
                                  join l in db.Lands on ls.Id equals l.LeaseStatusId
                                  join f in db.Facilities on l.Id equals f.LandId
                                  join lumd in db.LandUseManagementDetails on l.LandUseManagementDetailId equals lumd.Id
                                  join gl in db.GeographicalLocations on l.GeographicalLocationId equals gl.Id
                                  where lumd.IncomeLeaseStatus == "Yes"
                                  select new LeasedProperty
                                  {
                                      LeaseStatusesId = ls.Id,
                                      FileReference = f.FileReference,
                                      District = gl.Region,
                                      Type = f.Type,
                                      PropertyCode = f.ClientCode,
                                      FacilityName = f.Name,
                                      NatureofLease = ls.NatureOfLease,
                                      StartingDate = ls.StartingDate,
                                      TerminationDate = ls.TerminationDate,
                                      LandId = l.Id,
                                      Latitude = gl.Latitude,
                                      Longitude = gl.Longitude
                                  }).ToList();

                var list = leasedProperties.GroupBy(x => x.LeaseStatusesId).Select(g => g.First()).ToList();

                return list;
            }
        }       

        // Dispose implemented as no-op above
    }
}
