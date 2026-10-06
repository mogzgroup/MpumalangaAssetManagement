using MAM.DataAccess.Interfaces;
using MAM.DataAccess.Tables;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace MAM.DataAccess.Repositories
{
    public class FacilityRepository : IFacility, IDisposable
    {
        // No unmanaged resources; provide no-op Dispose to allow 'using' in callers.
        public void Dispose() { }

        private string _connectionString { get; set; }

        public FacilityRepository(string connectionString)
        {
            _connectionString = connectionString;
        }

        public int AddFacility(Facility facility)
        {
            using (var db = new DataContext(_connectionString))
            {
                db.Facilities.Add(facility);
                db.SaveChanges();
                return facility.Id;
            }
        }

        public void UpdateFacility(Facility facility)
        {
            using (var db = new DataContext(_connectionString))
            {
                db.Facilities.Update(facility);
                db.SaveChanges();
            }
        }

        public List<Facility> GetProperties(string userDepartment)
        {
            using (var db = new DataContext(_connectionString))
            {
                var list = db.Facilities.Where(f => f.Status != "Deleted" && f.Land.LandUseManagementDetail.UserDepartment.Trim().ToLower() == "signedoff")
                   .Include(a => a.Land)
                   .Include(f => f.Land.PropertyDescription)
                  .Include(a => a.Land.GeographicalLocation)
                   .Include(a => a.Land.LandUseManagementDetail)
                   .Include(a => a.Land.LeaseStatus)
                  .Include(a => a.Improvements)
                  .Include(a => a.Finance)
                  .Include(f => f.Finance.Valuation)
                   .Include(f => f.Finance.SecondaryInformationNote)
                   .ToList();
                return list;
            }
        }

        public List<string> GetTowns()
        {
            using (var db = new DataContext(_connectionString))
            {
                var towns = db.GeographicalLocations.Select(t => t.Town).Where(t => !string.IsNullOrEmpty(t)).Distinct().OrderBy(t => t).ToList();
                return towns;
            }
        }

        public List<Facility> GetBuildingsByTown(string town)
        {
            using (var db = new DataContext(_connectionString))
            {
                var query = from facility in db.Facilities
                            join land in db.Lands
                              on facility.LandId equals land.Id
                            join gl in db.GeographicalLocations
                              on land.GeographicalLocationId equals gl.Id
                            where gl.Town == town && facility.Type.ToLower() != "land" &&
                                !facility.Name.ToLower().Contains("land") && !facility.Name.ToLower().Contains("farm")
                            select facility;
                List<Facility> facilities = query.ToList();
                return facilities;
            }
        }

        public List<Facility> GetAllFacilities()
        {
            using (var db = new DataContext(_connectionString))
            {
                var list = db.Facilities.Where(f => f.Status != "Deleted").ToList();
                return list;
            }
        }

        public List<Facility> GetBuildings()
        {
            using (var db = new DataContext(_connectionString))
            {
                var list = db.Facilities.Where(f => f.Status != "Deleted" && f.Type.ToLower() != "land" &&
                                            !f.Name.ToLower().Contains("land") && !f.Name.ToLower().Contains("farm")).ToList();
                return list;
            }
        }

        public List<Facility> GetFacilities()
        {
            using (var db = new DataContext(_connectionString))
            {
                var list = db.Facilities.Where(f => f.Status.ToLower() != "deleted")
                   .Include(a => a.Land)
                   .Include(f => f.Land.PropertyDescription)
                  .Include(a => a.Land.GeographicalLocation)
                   .Include(a => a.Land.LandUseManagementDetail)
                   .Include(a => a.Land.LeaseStatus)
                  .Include(a => a.Improvements)
                  .Include(a => a.Finance)
                  .Include(f => f.Finance.Valuation)
                   .Include(f => f.Finance.SecondaryInformationNote)
                   .ToList();
                return list;
            }
        }

        public List<Facility> GetAssetRegisterFacilities()
        {
            using (var db = new DataContext(_connectionString))
            {
                var list = db.Facilities.Where(f => f.Status.ToLower() == "submitted" || f.Status.ToLower() == "saved" || f.Status.ToLower() == "new")
                   .Include(a => a.Land)
                   .Include(f => f.Land.PropertyDescription)
                  .Include(a => a.Land.GeographicalLocation)
                   .Include(a => a.Land.LandUseManagementDetail)
                   .Include(a => a.Land.LeaseStatus)
                  .Include(a => a.Improvements)
                  .Include(a => a.Finance)
                  .Include(f => f.Finance.Valuation)
                   .Include(f => f.Finance.SecondaryInformationNote)
                   .ToList();
                return list;
            }
        }

        public List<Facility> GetSignedOffFacilities()
        {
            using (var db = new DataContext(_connectionString))
            {
                var list = db.Facilities.Where(f => f.Status.ToLower() != "signedoff")
                   .Include(a => a.Land)
                   .Include(f => f.Land.PropertyDescription)
                  .Include(a => a.Land.GeographicalLocation)
                   .Include(a => a.Land.LandUseManagementDetail)
                   .Include(a => a.Land.LeaseStatus)
                  .Include(a => a.Improvements)
                  .Include(a => a.Finance)
                  .Include(f => f.Finance.Valuation)
                   .Include(f => f.Finance.SecondaryInformationNote)
                   .ToList();
                if (list.Count > 0)
                {
                    foreach (var facility in list)
                    {
                        facility.Status = "In UAMP";
                        // attach and update in the same context to reduce connection churn
                        db.Facilities.Update(facility);
                    }
                    db.SaveChanges();
                }
                return list;
            }
        }

        public Facility GetFacilityById(int id)
        {
            using (var db = new DataContext(_connectionString))
            {
                return db.Facilities.Where(f => f.Status != "Deleted" && f.Id == id)
                    .Include(a => a.Land)
                    .Include(f => f.Land.PropertyDescription)
                   .Include(a => a.Land.GeographicalLocation)
                    .Include(a => a.Land.LandUseManagementDetail)
                    .Include(a => a.Land.LeaseStatus).
                    Include(a => a.Improvements).Include(a => a.Finance).Include(f => f.Finance.Valuation)
                    .Include(f => f.Finance.SecondaryInformationNote)
                    .FirstOrDefault();
            }
        }

        // Dispose implemented as no-op above to support callers that use 'using'.
    }
}
