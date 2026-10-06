using MAM.DataAccess.Tables;
using System;
using System.Collections.Generic;

namespace MAM.DataAccess.Interfaces
{
    public interface IFaultNote
    {
        int AddFaultNote(FaultNote note);
        void UpdateFaultNote(FaultNote note);
        List<FaultNote> GetFaultNotesByFaultId(int faultId);
        void DeleteFaultNotesByFaultId(int faultId);
    }
}
