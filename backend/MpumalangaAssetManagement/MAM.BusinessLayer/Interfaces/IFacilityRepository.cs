using MAM.BusinessLayer.Models;
using MAM.BusinessLayer.Models.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace MAM.BusinessLayer.Interfaces
{
    public interface IFacilityRepository
    {
        List<FacilityType> GetFacilityZonings();
        List<DashboardWedge> GetDashboardWedges();
        List<FacilitySummaryChart> GetFacilitySummaries();
        List<MapCoordinate> GetMapCoordinates();
        Facility GetFacilityById(int id, FacilityTypes facilityType);
        Facility SaveFacility(string step, Facility facility);
        Land SaveLand(Land land);
        Finance SaveFinance(Finance finance);
        List<Improvement> SaveImprovement(List<Improvement> improvement, int facilityId);
        void UpdateFacility(string step, Facility facility);
        void UpdateLand(Land land);
        void UpdateFinance(Finance finance);
        void UpdateImprovement(List<Improvement> improvement);
        bool DeleteFacility(int id);
        List<Facility> GetProperties(string userDepartment);
        List<Facility> GetProjectFacilities();
        List<Facility> GetBuildings();
        List<Facility> GetAllFacilities();
        List<Facility> GetAssetRegisterFacilities();
        List<string> GetTowns();
        List<Facility> GetBuildingsByTown(string town);
    }
}
