using MAM.DataAccess.Tables;
using System;
using System.Collections.Generic;

namespace MAM.DataAccess.Interfaces
{
    public interface IOptimalSupportingAccommodationRepository
    {
        int AddOptimalSupportingAccommodation(OptimalSupportingAccommodation optimalSupportingAccommodation);
        void UpdateOptimalSupportingAccommodation(OptimalSupportingAccommodation optimalSupportingAccommodation);
        void DeleteOptimalSupportingAccommodation(OptimalSupportingAccommodation optimalSupportingAccommodation);
        OptimalSupportingAccommodation GetOptimalSupportingAccommodation(int id);
    }
}
