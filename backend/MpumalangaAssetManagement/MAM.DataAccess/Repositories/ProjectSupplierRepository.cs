using MAM.DataAccess.Interfaces;
using MAM.DataAccess.Tables;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace MAM.DataAccess.Repositories
{
    public class ProjectSupplierRepository : IProjectSupplier, IDisposable
    {
        // No unmanaged resources; provide no-op Dispose for callers that use 'using'
        public void Dispose() { }

        private string _connectionString { get; set; }

        public ProjectSupplierRepository(string connectionString)
        {
            _connectionString = connectionString;
        }

        public int AddProjectSupplier(ProjectSupplier projectSupplier)
        {
            using (var db = new DataContext(_connectionString))
            {
                db.ProjectSuppliers.Add(projectSupplier);
                db.SaveChanges();
                return projectSupplier.Id;
            }
        }

        public void UpdateProjectSupplier(ProjectSupplier projectSupplier)
        {
            using (var db = new DataContext(_connectionString))
            {
                db.ProjectSuppliers.Update(projectSupplier);
                db.SaveChanges();
            }
        }

        public List<ProjectSupplier> GetProjectSuppliers()
        {
            using (var db = new DataContext(_connectionString))
            {
                return db.ProjectSuppliers.ToList();
            }
        }

        public ProjectSupplier GetProjectSupplierById(int id)
        {
            using (var db = new DataContext(_connectionString))
            {
                return db.ProjectSuppliers.FirstOrDefault(b => b.Id == id);
            }
        }

        public void DeleteProjectSupplierById(int projectId)
        {
            using (var db = new DataContext(_connectionString))
            {
                var projectSuppliers = db.ProjectSuppliers.Where(s => s.ProjectId == projectId).ToList();
                foreach (var projectSupplier in projectSuppliers)
                {
                    db.ProjectSuppliers.Remove(projectSupplier);
                }
                
            }
        }

        // Dispose implemented as no-op above
    }
}
