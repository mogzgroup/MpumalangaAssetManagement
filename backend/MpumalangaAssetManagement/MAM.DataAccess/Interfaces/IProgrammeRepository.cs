using MAM.DataAccess.Tables;
using System;
using System.Collections.Generic;

namespace MAM.DataAccess.Interfaces
{
    public interface IProgrammeRepository
    {
        int AddProgramme(Programme programme);
        void AddProgrammes(List<Programme> programmes);
        void UpdateProgramme(Programme programme);
        void DeleteProgramme(Programme programme);
        List<Programme> GetProgrammes(int uampId);
    }
}
