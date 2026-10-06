using MAM.BusinessLayer.Interfaces;
using MAM.BusinessLayer.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace MAM.BusinessLayer.Repositories
{
    public class LeaseManagementRepository : ILeaseManagementRepository
    {
        private AppSettings appSettings { get; set; }
        private readonly MAM.DataAccess.Interfaces.ILeaseManegement _leaseDataAccess;
        private readonly MAM.DataAccess.Interfaces.ILandUseManagementDetailRepository _landUseDataAccess;
        private readonly MAM.DataAccess.Interfaces.ILand _landDataAccess;

        public LeaseManagementRepository(AppSettings settings, MAM.DataAccess.Interfaces.ILeaseManegement leaseDataAccess, MAM.DataAccess.Interfaces.ILandUseManagementDetailRepository landUseDataAccess, MAM.DataAccess.Interfaces.ILand landDataAccess)
        {
            appSettings = settings;
            _leaseDataAccess = leaseDataAccess;
            _landUseDataAccess = landUseDataAccess;
            _landDataAccess = landDataAccess;
        }

        public List<LeasedProperty> GetLeasedProperties()
        {
            LeasedProperty leasedProperty = new LeasedProperty();
            return leasedProperty.ConvertToLeasedProperties(_leaseDataAccess.GetLeasedProperties());
        }

        public bool DeleteLeasedProperty(LeasedProperty leasedProperty)
        {
            _landUseDataAccess.SetLandUseManagementDetailIncomeLeaseStatus(leasedProperty.LandUseManagementDetail.ConvertLandUseManagementDetail(leasedProperty.LandUseManagementDetail));
            return true;
        }

        public LeasedProperty GetLeasedPropertyDetails(LeasedProperty leasedProperty) {
            LandUseManagementDetail landUseManagementDetail = new LandUseManagementDetail();
            LeaseStatus leaseStatus = new LeaseStatus();
            var land = _landDataAccess.GetLeasedPropertyOnLandById(leasedProperty.LandId);
            leasedProperty.LandUseManagementDetail = landUseManagementDetail.ConvertLandUseManagementDetail(land.LandUseManagementDetail);
            leasedProperty.LeaseStatus = leaseStatus.ConvertLeaseStatus(land.LeaseStatus);
            return leasedProperty;
        }

        // Business-layer repository no longer manages unmanaged resources; data-access handles disposal.
    }
}
