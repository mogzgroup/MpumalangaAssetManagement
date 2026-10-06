using MAM.BusinessLayer.Models;
using MAM.BusinessLayer.Interfaces;
using System.Collections.Generic;

namespace MAM.BusinessLayer.Repositories
{
    // Thin business-layer repository that delegates to data-access repository via DI.
    public class CampRepository : ICampRepository
    {
        private readonly MAM.DataAccess.Interfaces.ICampRepository _dataAccess;

        public CampRepository(MAM.DataAccess.Interfaces.ICampRepository dataAccess)
        {
            _dataAccess = dataAccess;
        }

        public List<Camp> GetCamps(string department)
        {
            var camp = new Camp();
            var camps = new List<Camp>();
            var data = _dataAccess.GetCamps(department);
            var uamps = camp.ConvertToCamps(data);
            camps.AddRange(uamps);
            return camps;
        }
    }
}
