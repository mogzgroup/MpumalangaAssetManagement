using MAM.BusinessLayer.Models;
using MAM.BusinessLayer.Models.Enums;
using MAM.BusinessLayer.Interfaces;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MAM.API.Services
{
    public interface IFacilityService
    {
        List<DashboardWedge> GetDashboardWedges();
        List<FacilityType> GetFacilityZonings();
        List<FacilitySummaryChart> GetFacilitySummaries();
        List<MapCoordinate> GetMapCoordinates();
        List<Facility> GetAllFacilities();
        List<Facility> GetProjectFacilities();
        List<Facility> GetAssetRegisterFacilities();
        List<Facility> GetProperties(string userDepartment);
        Facility GetFacilityById(int id, FacilityTypes facilityType);
        Facility SaveFacility(string step, Facility facility);
        bool UpdateFacility(string step, Facility facility);
        bool DeleteFacility(int id);
        List<Facility> GetBuildings();
        List<string> GetTowns();

        List<Facility> GetBuildingsByTown(string town);
    }

    public class FacilityService : IFacilityService
    {
        private readonly AppSettings _appSettings;
        private readonly IFacilityRepository _facilityRepository;

        public FacilityService(IOptions<AppSettings> appSettings, IFacilityRepository facilityRepository)
        {
            _appSettings = appSettings.Value;
            _facilityRepository = facilityRepository;
        }

        public List<DashboardWedge> GetDashboardWedges() => _facilityRepository.GetDashboardWedges();

        public List<FacilityType> GetFacilityZonings() => _facilityRepository.GetFacilityZonings();

        public List<FacilitySummaryChart> GetFacilitySummaries() => _facilityRepository.GetFacilitySummaries();

        public List<MapCoordinate> GetMapCoordinates() => _facilityRepository.GetMapCoordinates();

        public List<Facility> GetAllFacilities() => _facilityRepository.GetAllFacilities();

        public List<Facility> GetProjectFacilities() => _facilityRepository.GetProjectFacilities();

        public List<Facility> GetBuildings() => _facilityRepository.GetBuildings();

        public List<Facility> GetAssetRegisterFacilities() => _facilityRepository.GetAssetRegisterFacilities();

        public List<Facility> GetProperties(string userDepartment) => _facilityRepository.GetProperties(userDepartment);

        public Facility GetFacilityById(int id, FacilityTypes facilityType) => _facilityRepository.GetFacilityById(id, facilityType);

        public Facility SaveFacility(string step, Facility facility) => _facilityRepository.SaveFacility(step, facility);

        public bool UpdateFacility(string step, Facility facility)
        {
            _facilityRepository.UpdateFacility(step, facility);
            return true;
        }

        public bool DeleteFacility(int id) => _facilityRepository.DeleteFacility(id);

        public List<string> GetTowns() => _facilityRepository.GetTowns();

        public List<Facility> GetBuildingsByTown(string town) => _facilityRepository.GetBuildingsByTown(town);
    }
}
