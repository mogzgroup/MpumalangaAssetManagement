using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MAM.BusinessLayer.Models;
using MAM.BusinessLayer.Repositories;
using Microsoft.Extensions.Options;

namespace MAM.API.Services
{
    public class CampService: ICampService
    {
        private readonly AppSettings _appSettings;

        public CampService(IOptions<AppSettings> appSettings)
        {
            _appSettings = appSettings.Value;
        }

        public List<Camp> GetCamps(string department) {
            return null;
            using (var _campRepository = new CampRepository(_appSettings))
            {
                return _campRepository.GetCamps(department);
            }
        }            
    }

    public interface ICampService
    {
        List<Camp> GetCamps(string department);
    }
}
