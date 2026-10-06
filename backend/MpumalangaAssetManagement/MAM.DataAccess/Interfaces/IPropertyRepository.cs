using MAM.DataAccess.Tables;
using System;
using System.Collections.Generic;

namespace MAM.DataAccess.Interfaces
{
    public interface IPropertyRepository
    {
        int AddProperty(Property property);
        void AddProperties(List<Property> properties);
        void UpdateProperty(Property property);
        void DeleteProperty(Property property);
        List<Property> GetProperties(int uampId);
        List<Property> GetProperties(int uampId, double templateNuber);
    }
}
