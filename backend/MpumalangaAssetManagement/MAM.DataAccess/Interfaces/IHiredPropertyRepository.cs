using MAM.DataAccess.Tables;
using System;
using System.Collections.Generic;

namespace MAM.DataAccess.Interfaces
{
     public interface IHiredPropertyRepository
    {
        int AddHiredProperty(HiredProperty hiredProperty);
        void UpdateHiredProperty(HiredProperty hiredProperty);
        void DeleteHiredProperty(HiredProperty hiredProperty);
        List<HiredProperty> GetHiredProperties();
    }
}
