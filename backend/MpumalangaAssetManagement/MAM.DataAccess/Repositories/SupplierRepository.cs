using MAM.DataAccess.Interfaces;
using MAM.DataAccess.Tables;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace MAM.DataAccess.Repositories
{
    public class SupplierRepository : ISupplier, IDisposable
    {
        // No unmanaged resources; provide no-op Dispose for callers that use 'using'
        public void Dispose() { }

        private string _connectionString { get; set; }

        public SupplierRepository(string connectionString)
        {
            _connectionString = connectionString;
        }

        public int AddSupplier(Supplier supplier)
        {
            using (var db = new DataContext(_connectionString))
            {
                db.Suppliers.Add(supplier);
                db.SaveChanges();
                return supplier.Id;
            }
        }

        public void UpdateSupplier(Supplier supplier)
        {
            using (var db = new DataContext(_connectionString))
            {
                db.Suppliers.Update(supplier);
                db.SaveChanges();
            }
        }

        public List<Supplier> GetSuppliers()
        {
            using (var db = new DataContext(_connectionString))
            {
                var suppliers = db.Suppliers.Select(s => s).ToList();
                return suppliers;
            }
        }

        public Supplier GetSupplierById(int id)
        {
            using (var db = new DataContext(_connectionString))
            {
                return db.Suppliers.FirstOrDefault(b => b.Id == id);
            }
        }

        // Dispose implemented as no-op above
    }
}
