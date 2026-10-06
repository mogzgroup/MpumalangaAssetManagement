using MAM.BusinessLayer.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace MAM.BusinessLayer.Interfaces
{
    public interface ILeaseManagementRepository
    {
        List<LeasedProperty> GetLeasedProperties();
        bool DeleteLeasedProperty(LeasedProperty leasedProperty);
        LeasedProperty GetLeasedPropertyDetails(LeasedProperty leasedProperty);
    }
}
