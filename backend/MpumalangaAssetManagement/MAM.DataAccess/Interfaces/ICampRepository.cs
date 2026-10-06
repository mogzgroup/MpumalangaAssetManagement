using System.Collections.Generic;
using MAM.DataAccess.Tables;

namespace MAM.DataAccess.Interfaces
{
    public interface ICampRepository
    {
        List<Camp> GetCamps(string department);
        int CreateUamp(Camp camp);
    }
}
