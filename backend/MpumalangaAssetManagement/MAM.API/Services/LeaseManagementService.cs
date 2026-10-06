using MAM.BusinessLayer.Models;
using MAM.BusinessLayer.Interfaces;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MAM.API.Services
{
    public interface ILeaseManagementService
    {
        List<LeasedProperty> GetLeasedProperties();        
        LeasedProperty GetLeasedPropertyDetails(LeasedProperty leasedProperty);
        bool DeleteLeasedProperty(LeasedProperty leasedProperty);
    }

    public class LeaseManagementService : ILeaseManagementService
    {
        private readonly AppSettings _appSettings;
        private readonly ILeaseManagementRepository _leaseManagementRepository;

        public LeaseManagementService(IOptions<AppSettings> appSettings, ILeaseManagementRepository leaseManagementRepository)
        {
            _appSettings = appSettings.Value;
            _leaseManagementRepository = leaseManagementRepository;
        }

        public List<LeasedProperty> GetLeasedProperties()
        {
            return _leaseManagementRepository.GetLeasedProperties();
        }

        public LeasedProperty GetLeasedPropertyDetails(LeasedProperty leasedProperty)
        {
            return _leaseManagementRepository.GetLeasedPropertyDetails(leasedProperty);
        }

        public bool DeleteLeasedProperty(LeasedProperty leasedProperty)
        {
            return _leaseManagementRepository.DeleteLeasedProperty(leasedProperty);
        }
    }
}
