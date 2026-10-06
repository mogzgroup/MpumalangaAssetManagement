using System.Collections.Generic;
using MAM.BusinessLayer.Models;

namespace MAM.BusinessLayer.Interfaces
{
    public interface ICampRepository
    {
        List<Camp> GetCamps(string department);
    }
}
