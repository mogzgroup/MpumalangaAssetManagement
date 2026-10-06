using MAM.BusinessLayer.Interfaces;
using MAM.BusinessLayer.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace MAM.BusinessLayer.Repositories
{
    public class SupplierRepository : ISupplierRepository
    {
        private AppSettings appSettings { get; set; }
        private readonly MAM.DataAccess.Interfaces.ISupplier _dataAccess;

        public SupplierRepository(AppSettings settings, MAM.DataAccess.Interfaces.ISupplier dataAccess)
        {
            appSettings = settings;
            _dataAccess = dataAccess;
        }
        public List<Supplier> AddSuppliers(List<Supplier> suppliers)
        {
            foreach (var supplier in suppliers)
            {
                supplier.Id = _dataAccess.AddSupplier(supplier.ConvertToSupplierTable(supplier));
            }

            return suppliers;
        }

        public List<Supplier> GetSuppliers()
        {
            Supplier supplier = new Supplier();
            return supplier.ConvertToSuppliers(_dataAccess.GetSuppliers());
        }

        // Business-layer repository does not manage unmanaged resources; data-access layer handles disposal.
    }
}
