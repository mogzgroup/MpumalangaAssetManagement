using MAM.DataAccess.Interfaces;
using MAM.DataAccess.Tables;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace MAM.DataAccess.Repositories
{
    public class LandRepository : ILand, IDisposable
    {
        // No unmanaged resources; provide no-op Dispose for callers that use 'using'
        public void Dispose() { }

        private string _connectionString { get; set; }

        public LandRepository(string connectionString)
        {
            _connectionString = connectionString;
        }

        #region Land
        public int AddLand(Land land)
        {
            using (var db = new DataContext(_connectionString))
            {
                db.Lands.Add(land);
                db.SaveChanges();
                return land.Id;
            }
        }

        public Land GetLandById(int id)
        {
            using (var db = new DataContext(_connectionString))
            {
                return db.Lands.FirstOrDefault(b => b.Id == id);
            }
        }

        public List<Land> GetLands()
        {
            using (var db = new DataContext(_connectionString))
            {
                return db.Lands.Select(l => l).ToList();
            }
        }

        public void UpdateLand(Land land)
        {
            using (var db = new DataContext(_connectionString))
            {
                db.Lands.Update(land);
                db.SaveChanges();
            }
        }



        public Land GetLeasedPropertyOnLandById(int id)
        {
            using (var db = new DataContext(_connectionString))
            {
                return db.Lands
                    .Include(a => a.LandUseManagementDetail)
                    .Include(a => a.LeaseStatus)
                    .FirstOrDefault(b => b.Id == id);
            }
        }

        #endregion

        #region Geographical Location
        public int AddGeographicalLocation(GeographicalLocation geographicalLocation)
        {
            using (var db = new DataContext(_connectionString))
            {
                db.GeographicalLocations.Add(geographicalLocation);
                db.SaveChanges();
                return geographicalLocation.Id;
            }
        }

        public void UpdateGeographicalLocation(GeographicalLocation geographicalLocation)
        {
            using (var db = new DataContext(_connectionString))
            {
                db.GeographicalLocations.Update(geographicalLocation);
                db.SaveChanges();
            }
        }

        public List<GeographicalLocation> GetGeographicalLocations()
        {
            using (var db = new DataContext(_connectionString))
            {
                return db.GeographicalLocations.Select(f => f).ToList();
            }
        }

        public GeographicalLocation GetGeographicalLocationById(int id)
        {
            using (var db = new DataContext(_connectionString))
            {
                return db.GeographicalLocations.FirstOrDefault(b => b.Id == id);
            }
        }
        #endregion

        #region Land Use Management Detail
        public int AddLandUseManagementDetail(LandUseManagementDetail landUseManagementDetail)
        {
            using (var db = new DataContext(_connectionString))
            {
                db.LandUseManagementDetails.Add(landUseManagementDetail);
                db.SaveChanges();
                return landUseManagementDetail.Id;
            }
        }

        public LandUseManagementDetail GetLandUseManagementDetailById(int id)
        {
            using (var db = new DataContext(_connectionString))
            {
                return db.LandUseManagementDetails.FirstOrDefault(b => b.Id == id);
            }
        }

        public List<LandUseManagementDetail> GetLandUseManagementDetails()
        {
            using (var db = new DataContext(_connectionString))
            {
                return db.LandUseManagementDetails.Select(l => l).ToList();
            }
        }

        public void UpdateLandUseManagementDetail(LandUseManagementDetail landUseManagementDetail)
        {
            using (var db = new DataContext(_connectionString))
            {
                db.LandUseManagementDetails.Update(landUseManagementDetail);
                db.SaveChanges();
            }
        }

        #endregion

        #region Property Description
        public int AddPropertyDescription(PropertyDescription propertyDescription)
        {
            using (var db = new DataContext(_connectionString))
            {
                db.PropertyDescriptions.Add(propertyDescription);
                db.SaveChanges();
                return propertyDescription.Id;
            }
        }

        public List<PropertyDescription> GetPropertyDescriptions()
        {
            using (var db = new DataContext(_connectionString))
            {
                return db.PropertyDescriptions.Select(f => f).ToList();
            }
        }

        public PropertyDescription GetPropertyDescriptionById(int id)
        {
            using (var db = new DataContext(_connectionString))
            {
                return db.PropertyDescriptions.FirstOrDefault(b => b.Id == id);
            }
        }

        public void UpdatePropertyDescription(PropertyDescription propertyDescription)
        {
            using (var db = new DataContext(_connectionString))
            {
                db.PropertyDescriptions.Update(propertyDescription);
                db.SaveChanges();
            }
        }
        #endregion

        #region Lease Status
        public int AddLeaseStatus(LeaseStatus leaseStatus)
        {
            using (var db = new DataContext(_connectionString))
            {
                db.LeaseStatuses.Add(leaseStatus);
                db.SaveChanges();
                return leaseStatus.Id;
            }
        }

        public LeaseStatus GetLeaseStatusById(int id)
        {
            using (var db = new DataContext(_connectionString))
            {
                return db.LeaseStatuses.FirstOrDefault(b => b.Id == id);
            }
        }

        public List<LeaseStatus> GetLeaseStatuses()
        {
            using (var db = new DataContext(_connectionString))
            {
                return db.LeaseStatuses.Select(l => l).ToList();
            }
        }

        public void UpdateLeaseStatus(LeaseStatus leaseStatus)
        {
            using (var db = new DataContext(_connectionString))
            {
                db.LeaseStatuses.Update(leaseStatus);
                db.SaveChanges();
            }
        }
        #endregion

        // Dispose implemented as no-op above
    }
}
