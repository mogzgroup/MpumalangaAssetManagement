using MAM.BusinessLayer.Models;
using MAM.BusinessLayer.Interfaces;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MAM.API.Services
{
    public interface IHiringRegisterService
    {
        List<HiredProperty> GetHiredProperties();
        bool UpdateHiredProperty(HiredProperty hiredProperty);
        bool DeleteHiredProperty(HiredProperty hiredProperty);
        int AddHiredProperty(HiredProperty hiredProperty);
    }
    public class HiringRegisterService : IHiringRegisterService
    {
        private readonly IHiringRegisterRepository _hiringRegisterRepository;

        public HiringRegisterService(IOptions<AppSettings> appSettings, IHiringRegisterRepository hiringRegisterRepository)
        {
            _hiringRegisterRepository = hiringRegisterRepository;
        }

        public List<HiredProperty> GetHiredProperties() => _hiringRegisterRepository.GetHiredProperties();
        public bool UpdateHiredProperty(HiredProperty hiredProperty) => _hiringRegisterRepository.UpdateHiredProperty(hiredProperty);
        public bool DeleteHiredProperty(HiredProperty hiredProperty) => _hiringRegisterRepository.DeleteHiredProperty(hiredProperty);
        public int AddHiredProperty(HiredProperty hiredProperty) => _hiringRegisterRepository.AddHiredProperty(hiredProperty);
    }
}
