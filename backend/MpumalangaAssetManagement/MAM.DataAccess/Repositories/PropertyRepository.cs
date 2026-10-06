using MAM.DataAccess.Interfaces;
using MAM.DataAccess.Tables;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace MAM.DataAccess.Repositories
{
    public class PropertyRepository : IPropertyRepository, IDisposable
    {
        private string _connectionString { get; set; }

        public PropertyRepository(string connectionString)
        {
            _connectionString = connectionString;
        }

        public int AddProperty(Property property)
        {
            using (var db = new DataContext(_connectionString))
            {
                db.Properties.Add(property);
                db.SaveChanges();
                return property.Id;
            }
        }

        public void AddProperties(List<Property> properties)
        {
            if (properties == null || properties.Count == 0)
                return;
            using (var db = new DataContext(_connectionString))
            {
                db.Properties.AddRange(properties);
                db.SaveChanges();
            }
        }

        public void UpdateProperty(Property property)
        {
            using (var db = new DataContext(_connectionString))
            {
                db.Properties.Update(property);
                db.SaveChanges();
            }
        }

        public void DeleteProperty(Property property)
        {
            using (var db = new DataContext(_connectionString))
            {
                db.Properties.Remove(property);
                db.SaveChanges();
            }
        }

        public List<Property> GetProperties(int uampId)
        {
            using (var db = new DataContext(_connectionString))
            {
                return db.Properties.Where(p => p.UserImmovableAssetManagementPlanId == uampId).ToList();
            }
        }

        public List<Property> GetProperties(int uampId,double templateNuber)
        {
            using (var db = new DataContext(_connectionString))
            {
                return db.Properties.Where(p => p.UserImmovableAssetManagementPlanId == uampId && p.TempleteNumber == templateNuber).ToList();
            }
        }

        // No unmanaged resources to dispose; keep a no-op Dispose to allow using() pattern in callers
        public void Dispose() { }
    }
}
