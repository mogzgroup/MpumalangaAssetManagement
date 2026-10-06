using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MAM.BusinessLayer.Models;
using MAM.BusinessLayer.Repositories;
using Microsoft.Extensions.Options;

namespace MAM.API.Services
{
    public class CampService : ICampService
    {
        private readonly MAM.BusinessLayer.Interfaces.ICampRepository _campRepository;

        public CampService(MAM.BusinessLayer.Interfaces.ICampRepository campRepository)
        {
            _campRepository = campRepository;
        }

        public List<Camp> GetCamps(string department)
        {
            return _campRepository.GetCamps(department);
        }
    }

    public interface ICampService
    {
        List<Camp> GetCamps(string department);
    }
}
