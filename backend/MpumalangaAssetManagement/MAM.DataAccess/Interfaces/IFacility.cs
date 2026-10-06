using MAM.DataAccess.Tables;
using System;
using System.Collections.Generic;

namespace MAM.DataAccess.Interfaces
{
    public interface IFacility
    {
        int AddFacility(Facility facility);
        void UpdateFacility(Facility facility);
        List<Facility> GetSignedOffFacilities();
        List<Facility> GetFacilities();
        Facility GetFacilityById(int id);
        List<Facility> GetAssetRegisterFacilities();
        List<Facility> GetBuildings();
        List<string> GetTowns();
        List<Facility> GetBuildingsByTown(string town);
    }
}
