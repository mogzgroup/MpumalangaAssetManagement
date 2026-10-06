using MAM.DataAccess.Tables;
using System;
using System.Collections.Generic;

namespace MAM.DataAccess.Interfaces
{
    public interface IFault
    {
        int AddFault(Fault fault);
        void AddFaults(List<Fault> faults);
        void UpdateFault(Fault fault);
        List<Fault> GetFaults();
        Fault GetFaultById(int id);
        Fault GetFaultByReferenceNo(string referenceNo);
    }
}
