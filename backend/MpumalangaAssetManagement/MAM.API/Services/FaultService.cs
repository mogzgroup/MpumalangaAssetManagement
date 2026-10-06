using MAM.BusinessLayer.Models;
using MAM.BusinessLayer.Interfaces;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MAM.API.Services
{
    public interface IFaultService
    {
        List<Fault> GetFaults();
        bool UpdateFault(Fault fault);
        bool DeleteFault(Fault fault);
        int AddFault(Fault fault);
        Fault GetFaultByReferenceNo(string referenceNo);
    }
    
    public class FaultService: IFaultService
    {
        private readonly AppSettings _appSettings;
        private readonly IFaultRepository _faultRepository;

        public FaultService(IOptions<AppSettings> appSettings, IFaultRepository faultRepository)
        {
            _appSettings = appSettings.Value;
            _faultRepository = faultRepository;
        }

        public List<Fault> GetFaults() => _faultRepository.GetFaults();
        public bool UpdateFault(Fault fault) => _faultRepository.UpdateFault(fault);
        public bool DeleteFault(Fault fault) => _faultRepository.DeleteFault(fault);
        public int AddFault(Fault fault) => _faultRepository.AddFault(fault);
        public Fault GetFaultByReferenceNo(string referenceNo) => _faultRepository.GetFaultByReferenceNo(referenceNo);
    }
}
