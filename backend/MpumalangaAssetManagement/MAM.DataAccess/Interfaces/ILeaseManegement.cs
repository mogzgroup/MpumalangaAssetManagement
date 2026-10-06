using System;
using System.Collections.Generic;

namespace MAM.DataAccess.Interfaces
{
    public interface ILeaseManegement
    {
        List<MAM.DataAccess.Tables.LeasedProperty> GetLeasedProperties();
    }
}
