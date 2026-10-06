using MAM.BusinessLayer.Models;
using MAM.BusinessLayer.Interfaces;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MAM.API.Services
{
    public interface ISupplierService
    {
        List<Supplier> AddSuppliers(List<Supplier> suppliers);
        List<Supplier> GetSuppliers();
    }
    public class SupplierService : ISupplierService
    {
        private readonly AppSettings _appSettings;
        private readonly ISupplierRepository _supplierRepository;

        public SupplierService(IOptions<AppSettings> appSettings, ISupplierRepository supplierRepository)
        {
            _appSettings = appSettings.Value;
            _supplierRepository = supplierRepository;
        }

        public List<Supplier> AddSuppliers(List<Supplier> suppliers) => _supplierRepository.AddSuppliers(suppliers);

        public List<Supplier> GetSuppliers() => _supplierRepository.GetSuppliers();
    }
}
