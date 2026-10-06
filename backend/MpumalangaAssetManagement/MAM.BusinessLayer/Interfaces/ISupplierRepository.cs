using MAM.BusinessLayer.Models;
using System.Collections.Generic;

namespace MAM.BusinessLayer.Interfaces
{
    public interface ISupplierRepository
    {
        List<Supplier> AddSuppliers(List<Supplier> suppliers);
        List<Supplier> GetSuppliers();
    }
}
