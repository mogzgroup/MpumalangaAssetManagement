using MAM.DataAccess.Tables;
using System;
using System.Collections.Generic;

namespace MAM.DataAccess.Interfaces
{
    public interface ILand
    {
        int AddLand(Land land);
        void UpdateLand(Land land);
        List<Land> GetLands();
        Land GetLandById(int id);
        Land GetLeasedPropertyOnLandById(int id);

        //Lease Status
        int AddLeaseStatus(LeaseStatus leaseStatus);
        void UpdateLeaseStatus(LeaseStatus leaseStatus);
        List<LeaseStatus> GetLeaseStatuses();
        LeaseStatus GetLeaseStatusById(int id);

        //Land use management detail
        int AddLandUseManagementDetail(LandUseManagementDetail landUseManagementDetail);
        void UpdateLandUseManagementDetail(LandUseManagementDetail landUseManagementDetail);
        List<LandUseManagementDetail> GetLandUseManagementDetails();
        LandUseManagementDetail GetLandUseManagementDetailById(int id);

        //Geographical location
        int AddGeographicalLocation(GeographicalLocation geographicalLocation);
        void UpdateGeographicalLocation(GeographicalLocation geographicalLocation);
        List<GeographicalLocation> GetGeographicalLocations();
        GeographicalLocation GetGeographicalLocationById(int id);

        //P6roperty description
        int AddPropertyDescription(PropertyDescription propertyDescription);
        void UpdatePropertyDescription(PropertyDescription propertyDescription);
        List<PropertyDescription> GetPropertyDescriptions();
        PropertyDescription GetPropertyDescriptionById(int id);
    }
}
