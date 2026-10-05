using MAM.BusinessLayer.Interfaces;
using MAM.BusinessLayer.Models;
using MAM.BusinessLayer.Models.Enums;
using Microsoft.Win32.SafeHandles;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;

namespace MAM.BusinessLayer.Repositories
{
    public class FacilityRepository : IFacilityRepository, IDisposable
    {
        private AppSettings appSettings { get; set; }
        // Flag: Has Dispose already been called?
        bool disposed = false;
        // Instantiate a SafeHandle instance.
        SafeHandle handle = new SafeFileHandle(IntPtr.Zero, true);

        public FacilityRepository(AppSettings settings)
        {
            appSettings = settings;
        }

        public List<FacilityType> GetFacilityZonings()
        {
            Facility facility = new Facility();
            List<FacilityType> facilityTypes = new List<FacilityType>();

            using (var dataAccess = new DataAccess.Repositories.FacilityRepository(appSettings.ConnectionString))
            {
                FacilityType facilityType = new FacilityType()
                {
                    Name = "Dwellings",
                    FacilityZonings = new List<FacilityZoning>()
                };

                var facilities = facility.ConvertToFacilities(dataAccess.GetFacilities()).Where(f => f.Land.LandUseManagementDetail.Zoning != null);
                var zonings = facilities.Select(d => d.Land.LandUseManagementDetail.Zoning.ToLower().Trim()).Distinct();
                foreach (var zoning in zonings)
                {
                    FacilityZoning facilityZoning = new FacilityZoning()
                    {
                        Name = zoning,
                        SignedOff = facilities.Where(d => d.Land.LandUseManagementDetail.Zoning.ToLower().Trim() == zoning.ToLower().Trim() && d.Status == "Completed").Count(),
                        Total = facilities.Where(d => d.Land.LandUseManagementDetail.Zoning.ToLower().Trim() == zoning.ToLower().Trim()).Count(),
                    };
                    facilityType.FacilityZonings.Add(facilityZoning);
                }
                facilityTypes.Add(facilityType);
            }
            return facilityTypes;
        }

        public List<DashboardWedge> GetDashboardWedges()
        {
            List<DashboardWedge> list = new List<DashboardWedge>();
            List<Facility> facilities = new List<Facility>();
            List<string> dashboardWedges = new List<string>();
            dashboardWedges.Add("Number of properties");
            dashboardWedges.Add("Signed off properties");
            dashboardWedges.Add("Non Residential Buildings");
            dashboardWedges.Add("Dwellings");
            dashboardWedges.Add("Land");

            using (var dataAccess = new DataAccess.Repositories.FacilityRepository(appSettings.ConnectionString))
            {
                var _facilities = dataAccess.GetFacilities();

                foreach (var wedge in dashboardWedges)
                {
                    DashboardWedge dashboardWedge = new DashboardWedge();
                    dashboardWedge.Name = wedge;
                    if (dashboardWedge.Name == "Number of properties")
                    {
                        dashboardWedge.Total = _facilities.Count();
                    }
                    if (dashboardWedge.Name == "Signed off properties")
                    {
                        dashboardWedge.Total = _facilities.Where(d => d.Status == "Signed off").Count();
                    }
                    if (dashboardWedge.Name == "Non Residential Buildings")
                        dashboardWedge.Total = _facilities.Where(d => d.Type == "Non Residential").Count();

                    if (dashboardWedge.Name == "Dwellings")
                        dashboardWedge.Total = _facilities.Where(d => d.Type == "Dwelling").Count();

                    if (dashboardWedge.Name == "Land")
                        dashboardWedge.Total = _facilities.Where(d => d.Type == "Land").Count();

                    list.Add(dashboardWedge);
                }
            }
            return list;
        }

        public List<FacilitySummaryChart> GetFacilitySummaries()
        {

            List<FacilitySummaryChart> facilitySummaryChartData = new List<FacilitySummaryChart>();

            /*using (var dataAccess = new DataAccess.Repositories.MtefBudgetPeriodRepository(appSettings.ConnectionString))
            {
                var facilities = dataAccess.GetFacilityStatements();
                int year = DateTime.Now.Year;

                for (int i = 0; i < 3; i++)
                {
                    FacilitySummaryChart facilitySummaryChart = new FacilitySummaryChart()
                    {
                        Year = year,
                        FacilitySummaries = new List<FacilitySummary>()
                    };
                    var dbRecord = facilities.FirstOrDefault(f => f.Year == year);
                    if (dbRecord != null)
                    {
                        FacilitySummary _facilitySummaries = new FacilitySummary()
                        {
                            Type = facilities.FirstOrDefault(f => f.Year == year && f.FacilityType == (int)FacilityTypes.Dwellings).FacilityType,
                            Year = facilities.FirstOrDefault(f => f.Year == year && f.FacilityType == (int)FacilityTypes.Dwellings).Year,
                            OpeningBalance = facilities.Where(f => f.Year == year && f.FacilityType == (int)FacilityTypes.Dwellings).Sum(f => Convert.ToDecimal(f.OpeningBalance)),
                            Additions = facilities.Where(f => f.Year == year && f.FacilityType == (int)FacilityTypes.Dwellings).Sum(f => Convert.ToDecimal(f.Additions)),
                            PpeaIn = facilities.Where(f => f.Year == year && f.FacilityType == (int)FacilityTypes.Dwellings).Sum(f => Convert.ToDecimal(f.PpeaIN)),
                            PpeaOut = facilities.Where(f => f.Year == year && f.FacilityType == (int)FacilityTypes.Dwellings).Sum(f => Convert.ToDecimal(f.PpeaOut)),
                            Disposals = facilities.Where(f => f.Year == year && f.FacilityType == (int)FacilityTypes.Dwellings).Sum(f => Convert.ToDecimal(f.Disposal)),
                            ClosingBalance = facilities.Where(f => f.Year == year && f.FacilityType == (int)FacilityTypes.Dwellings).Sum(f => Convert.ToDecimal(f.ClosingBalance)),
                            FacilityType = "Dwellings"
                        };
                        facilitySummaryChart.FacilitySummaries.Add(_facilitySummaries);

                        FacilitySummary _facilitySummariesNonRes = new FacilitySummary()
                        {
                            Type = facilities.FirstOrDefault(f => f.Year == year && f.FacilityType == (int)FacilityTypes.NonResidentialBuildings).FacilityType,
                            Year = facilities.FirstOrDefault(f => f.Year == year && f.FacilityType == (int)FacilityTypes.NonResidentialBuildings).Year,
                            OpeningBalance = facilities.Where(f => f.Year == year && f.FacilityType == (int)FacilityTypes.NonResidentialBuildings).Sum(f => Convert.ToDecimal(f.OpeningBalance)),
                            Additions = facilities.Where(f => f.Year == year && f.FacilityType == (int)FacilityTypes.NonResidentialBuildings).Sum(f => Convert.ToDecimal(f.Additions)),
                            PpeaIn = facilities.Where(f => f.Year == year && f.FacilityType == (int)FacilityTypes.NonResidentialBuildings).Sum(f => Convert.ToDecimal(f.PpeaIN)),
                            PpeaOut = facilities.Where(f => f.Year == year && f.FacilityType == (int)FacilityTypes.NonResidentialBuildings).Sum(f => Convert.ToDecimal(f.PpeaOut)),
                            Disposals = facilities.Where(f => f.Year == year && f.FacilityType == (int)FacilityTypes.NonResidentialBuildings).Sum(f => Convert.ToDecimal(f.Disposal)),
                            ClosingBalance = facilities.Where(f => f.Year == year && f.FacilityType == (int)FacilityTypes.NonResidentialBuildings).Sum(f => Convert.ToDecimal(f.ClosingBalance)),
                            FacilityType = "Non Residential Buildings"
                        };
                        facilitySummaryChart.FacilitySummaries.Add(_facilitySummariesNonRes);

                        FacilitySummary _facilitySummariesLand = new FacilitySummary()
                        {
                            Type = facilities.FirstOrDefault(f => f.Year == year && f.FacilityType == (int)FacilityTypes.Land).FacilityType,
                            Year = facilities.FirstOrDefault(f => f.Year == year && f.FacilityType == (int)FacilityTypes.Land).Year,
                            OpeningBalance = facilities.Where(f => f.Year == year && f.FacilityType == (int)FacilityTypes.Land).Sum(f => Convert.ToDecimal(f.OpeningBalance)),
                            Additions = facilities.Where(f => f.Year == year && f.FacilityType == (int)FacilityTypes.Land).Sum(f => Convert.ToDecimal(f.Additions)),
                            PpeaIn = facilities.Where(f => f.Year == year && f.FacilityType == (int)FacilityTypes.Land).Sum(f => Convert.ToDecimal(f.PpeaIN)),
                            PpeaOut = facilities.Where(f => f.Year == year && f.FacilityType == (int)FacilityTypes.Land).Sum(f => Convert.ToDecimal(f.PpeaOut)),
                            Disposals = facilities.Where(f => f.Year == year && f.FacilityType == (int)FacilityTypes.Land).Sum(f => Convert.ToDecimal(f.Disposal)),
                            ClosingBalance = facilities.Where(f => f.Year == year && f.FacilityType == (int)FacilityTypes.Land).Sum(f => Convert.ToDecimal(f.ClosingBalance)),
                            FacilityType = "Land"
                        };
                        facilitySummaryChart.FacilitySummaries.Add(_facilitySummariesLand);
                    }

                    facilitySummaryChartData.Add(facilitySummaryChart);
                    year--;
                }
            }*/
            return facilitySummaryChartData;
        }

        public List<Facility> GetBuildingsByTown(string town)
        {
            using (var dataAccess = new DataAccess.Repositories.FacilityRepository(appSettings.ConnectionString))
            {
                Facility facility = new Facility();
                List<Facility> facilities = facility.ConvertToFacilities(dataAccess.GetBuildingsByTown(town));
                return facilities;
            }
        }

        public List<string> GetTowns()
        {
            using (var dataAccess = new DataAccess.Repositories.FacilityRepository(appSettings.ConnectionString))
            {
                var towns = dataAccess.GetTowns();
                return towns;
            }
        }

        public List<MapCoordinate> GetMapCoordinates()
        {
            List<MapCoordinate> mapCoordinates = new List<MapCoordinate>();
            using (var dataAccess = new DataAccess.Repositories.FacilityRepository(appSettings.ConnectionString))
            {
                var facilities = dataAccess.GetFacilities();
                foreach (var item in facilities)
                {
                    if (item.Land != null)
                    {
                        if (item.Land.GeographicalLocation != null)
                        {
                            if (!string.IsNullOrEmpty(item.Land.GeographicalLocation.Longitude) && !string.IsNullOrEmpty(item.Land.GeographicalLocation.Latitude))
                            {
                                MapCoordinate mapCoordinate = new MapCoordinate()
                                {
                                    Longitude = item.Land.GeographicalLocation.Longitude.Replace(",", "."),
                                    Latitude = item.Land.GeographicalLocation.Latitude.Replace(",", "."),
                                    Description = item.Name,
                                    FacilityId = item.Id,
                                    FacilityType = FacilityTypes.Dwellings
                                };
                                mapCoordinates.Add(mapCoordinate);
                            }
                        }
                    }

                }
            }
            return mapCoordinates;
        }

        public List<Facility> GetAllFacilities()
        {
            List<Facility> facilities = new List<Facility>();
            Facility facility = new Facility();
            using (var dataAccess = new DataAccess.Repositories.FacilityRepository(appSettings.ConnectionString))
            {
                var _facilities = facility.ConvertToFacilities(dataAccess.GetFacilities());
                facilities.AddRange(_facilities);
            }
            return facilities;
        }
                
        public List<Facility> GetAssetRegisterFacilities()
        {
            List<Facility> facilities = new List<Facility>();
            Facility facility = new Facility();
            using (var dataAccess = new DataAccess.Repositories.FacilityRepository(appSettings.ConnectionString))
            {
                var _facilities = facility.ConvertToFacilities(dataAccess.GetAssetRegisterFacilities());
                facilities.AddRange(_facilities);
            }
            return facilities;
        }

        public List<Facility> GetProperties(string userDepartment)
        {
            List<Facility> facilities = new List<Facility>();
            Facility facility = new Facility();
            using (var dataAccess = new DataAccess.Repositories.FacilityRepository(appSettings.ConnectionString))
            {
                var _facilities = facility.ConvertToFacilities(dataAccess.GetProperties(userDepartment));
                facilities.AddRange(_facilities);
            }
            return facilities;
        }

        public List<Facility> GetProjectFacilities()
        {
            List<Facility> facilities = new List<Facility>();
            Facility facility = new Facility();
            using (var dataAccess = new DataAccess.Repositories.FacilityRepository(appSettings.ConnectionString))
            {
                var _facilities = facility.ConvertToFacilities(dataAccess.GetAllFacilities());
                facilities.AddRange(_facilities);
            }
            return facilities;
        }

        public List<Facility> GetBuildings()
        {
            List<Facility> facilities = new List<Facility>();
            Facility facility = new Facility();
            using (var dataAccess = new DataAccess.Repositories.FacilityRepository(appSettings.ConnectionString))
            {
                var _facilities = facility.ConvertToFacilities(dataAccess.GetBuildings());
                facilities.AddRange(_facilities);
            }
            return facilities;
        }

        public Facility GetFacilityById(int id, FacilityTypes facilityType)
        {
            Facility facility = new Facility();

            using (var dataAccess = new DataAccess.Repositories.FacilityRepository(appSettings.ConnectionString))
            {
                facility = facility.ConvertToFacility(dataAccess.GetFacilityById(id));

            }

            return facility;
        }

        public Facility CreateFacility(Facility facility)
        {
            using (var dataAccess = new DataAccess.Repositories.FacilityRepository(appSettings.ConnectionString))
            {
                facility.Id = dataAccess.AddFacility(facility.ConvertToFacility(facility));
            }
            return facility;
        }

        public Facility SaveFacility(string step, Facility facility)
        {
            facility.Land = SaveLand(facility.Land);
            facility.LandId = facility.Land.Id;
            
            facility.Finance = SaveFinance(facility.Finance);
            facility.FinanceId = facility.Finance.Id;
                        
           using (var dataAccess = new DataAccess.Repositories.FacilityRepository(appSettings.ConnectionString))
           {
                if (facility.Id == 0)
                {
                    facility.Id = dataAccess.AddFacility(facility.ConvertToFacility(facility));
                }
                else {
                    dataAccess.UpdateFacility(facility.ConvertToFacility(facility));
                }
            }
            
            facility.Improvements = SaveImprovement(facility.Improvements, facility.Id);
            
            return facility;
        }

        public void UpdateFacility(string step, Facility facility)
        {
            if (step.Trim().ToLower().Equals("land") || step.Trim().ToLower().Equals("facility"))
            {
                UpdateLand(facility.Land);
            }

            if (step.Trim().ToLower().Equals("finance") || step.Trim().ToLower().Equals("facility"))
            {
                UpdateFinance(facility.Finance);
            }

            if (step.Trim().ToLower().Equals("facility"))
            {
                using (var dataAccess = new DataAccess.Repositories.FacilityRepository(appSettings.ConnectionString))
                {
                    dataAccess.UpdateFacility(facility.ConvertToFacility(facility));
                }
            }

            if (step.Trim().ToLower().Equals("improvement") || step.Trim().ToLower().Equals("facility"))
            {
                UpdateImprovement(facility.Improvements);
            }
        }

        public Land SaveLand(Land land)
        {

            using (var dataAccess = new DataAccess.Repositories.LandRepository(appSettings.ConnectionString))
            {
                if (land.PropertyDescription.Id == 0)
                {
                    land.PropertyDescription.Id = dataAccess.AddPropertyDescription(land.PropertyDescription.ConvertPropertyDescription(land.PropertyDescription));
                    land.PropertyDescriptionId = land.PropertyDescription.Id;
                }
                else {
                    dataAccess.UpdatePropertyDescription(land.PropertyDescription.ConvertPropertyDescription(land.PropertyDescription));
                    land.PropertyDescriptionId = land.PropertyDescription.Id;
                }

                if (land.GeographicalLocation.Id == 0)
                {
                    land.GeographicalLocation.Id = dataAccess.AddGeographicalLocation(land.GeographicalLocation.ConvertGeographicalLocation(land.GeographicalLocation));
                    land.GeographicalLocationId = land.GeographicalLocation.Id;
                }
                else {
                    dataAccess.UpdateGeographicalLocation(land.GeographicalLocation.ConvertGeographicalLocation(land.GeographicalLocation));
                    land.GeographicalLocationId = land.GeographicalLocation.Id;
                }

                if (land.LeaseStatus.Id == 0)
                {
                    land.LeaseStatus.Id = dataAccess.AddLeaseStatus(land.LeaseStatus.ConvertLeaseStatus(land.LeaseStatus));
                    land.LeaseStatusId = land.LeaseStatus.Id;
                }
                else {
                    dataAccess.UpdateLeaseStatus(land.LeaseStatus.ConvertLeaseStatus(land.LeaseStatus));
                    land.LeaseStatusId = land.LeaseStatus.Id;
                }

                if (land.LandUseManagementDetail.Id == 0)
                {
                    land.LandUseManagementDetail.Id = dataAccess.AddLandUseManagementDetail(land.LandUseManagementDetail.ConvertLandUseManagementDetail(land.LandUseManagementDetail));
                    land.LandUseManagementDetailId = land.LandUseManagementDetail.Id;
                }
                else {
                    dataAccess.UpdateLandUseManagementDetail(land.LandUseManagementDetail.ConvertLandUseManagementDetail(land.LandUseManagementDetail));
                    land.LandUseManagementDetailId = land.LandUseManagementDetail.Id;
                }

                if (land.Id == 0)
                {
                    land.Id = dataAccess.AddLand(land.ConvertLand(land));
                }
                else {
                    dataAccess.UpdateLand(land.ConvertLand(land));
                }
            }
            return land;
        }

        public Finance SaveFinance(Finance finance)
        {

            using (var dataAccess = new DataAccess.Repositories.FinanceRepository(appSettings.ConnectionString))
            {
                if (finance.SecondaryInformationNote.Id == 0)
                {
                    finance.SecondaryInformationNote.Id = dataAccess.AddSecondaryInformationNote(finance.SecondaryInformationNote.ConvertToSecondaryInformationNote(finance.SecondaryInformationNote));
                    finance.SecondaryInformationNoteId = finance.SecondaryInformationNote.Id;
                }
                else {
                    dataAccess.UpdateSecondaryInformationNote(finance.SecondaryInformationNote.ConvertToSecondaryInformationNote(finance.SecondaryInformationNote));
                }

                if (finance.Valuation.Id == 0)
                {
                    finance.Valuation.Id = dataAccess.AddValuation(finance.Valuation.ConvertToValuation(finance.Valuation));
                    finance.ValuationId = finance.Valuation.Id;
                }
                else {
                    dataAccess.UpdateValuation(finance.Valuation.ConvertToValuation(finance.Valuation));
                }

                if (finance.Id == 0)
                {
                    finance.Id = dataAccess.AddFinance(finance.ConvertToFinance(finance));
                }
                else {
                    dataAccess.UpdateFinance(finance.ConvertToFinance(finance));
                }
            }
            return finance;
        }

        public List<Improvement> SaveImprovement(List<Improvement> improvements, int facilityId)
        {
            Improvement improvement = new Improvement();
            using (var dataAccess = new DataAccess.Repositories.ImprovementRepository(appSettings.ConnectionString))
            {
                foreach (var item in improvements)
                {
                    item.FacilityId = facilityId;
                    if (item.Id == 0)
                    {
                        item.Id = dataAccess.AddImprovement(improvement.ConvertToImprovement(item));
                    }
                    else {
                        dataAccess.UpdateImprovement(improvement.ConvertToImprovement(item));
                    }
                    
                }
            }
            return improvements;
        }

        public void UpdateLand(Land land)
        {

            using (var dataAccess = new DataAccess.Repositories.LandRepository(appSettings.ConnectionString))
            {
                dataAccess.UpdatePropertyDescription(land.PropertyDescription.ConvertPropertyDescription(land.PropertyDescription));

                dataAccess.UpdateGeographicalLocation(land.GeographicalLocation.ConvertGeographicalLocation(land.GeographicalLocation));

                dataAccess.UpdateLeaseStatus(land.LeaseStatus.ConvertLeaseStatus(land.LeaseStatus));

                dataAccess.UpdateLandUseManagementDetail(land.LandUseManagementDetail.ConvertLandUseManagementDetail(land.LandUseManagementDetail));

                dataAccess.UpdateLand(land.ConvertLand(land));
            }
        }

        public void UpdateFinance(Finance finance)
        {

            using (var dataAccess = new DataAccess.Repositories.FinanceRepository(appSettings.ConnectionString))
            {
                dataAccess.UpdateSecondaryInformationNote(finance.SecondaryInformationNote.ConvertToSecondaryInformationNote(finance.SecondaryInformationNote));

                dataAccess.UpdateValuation(finance.Valuation.ConvertToValuation(finance.Valuation));

                dataAccess.UpdateFinance(finance.ConvertToFinance(finance));
            }
        }

        public void UpdateImprovement(List<Improvement> improvements)
        {
            Improvement improvement = new Improvement();
            using (var dataAccess = new DataAccess.Repositories.ImprovementRepository(appSettings.ConnectionString))
            {
                foreach (var item in improvements)
                {
                    if (item.Id == 0)
                    {
                        dataAccess.AddImprovement(improvement.ConvertToImprovement(item));
                    }
                    else
                    {
                        dataAccess.UpdateImprovement(improvement.ConvertToImprovement(item));
                    }
                }
            }
        }

        public bool DeleteFacility(int id)
        {
            Facility facility = new Facility();
            bool isDeleted = false;
            using (var dataAccess = new DataAccess.Repositories.FacilityRepository(appSettings.ConnectionString))
            {
                var dbFacility = dataAccess.GetFacilityById(id);
                dbFacility.Status = "Deleted";
                dbFacility.ModifiedDate = DateTime.Now;
                dataAccess.UpdateFacility(dbFacility);
                isDeleted = true;
            }
            return isDeleted;
        }

        public void Dispose()
        {
            // Dispose of unmanaged resources.
            Dispose(true);
            // Suppress finalization.
            GC.SuppressFinalize(this);
        }

        // Protected implementation of Dispose pattern.
        protected virtual void Dispose(bool disposing)
        {
            if (disposed)
                return;

            if (disposing)
            {
                handle.Dispose();
                // Free any other managed objects here.
                //
            }

            disposed = true;
        }
    }
}
