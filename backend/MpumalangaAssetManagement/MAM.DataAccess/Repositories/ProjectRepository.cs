using MAM.DataAccess.Interfaces;
using MAM.DataAccess.Tables;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace MAM.DataAccess.Repositories
{
    public class ProjectRepository : IProject, IDisposable
    {
        // No unmanaged resources; provide no-op Dispose for callers that use 'using'
        public void Dispose() { }

        private string _connectionString { get; set; }

        public ProjectRepository(string connectionString)
        {
            _connectionString = connectionString;
        }

        public int AddProject(Project project)
        {
            using (var db = new DataContext(_connectionString))
            {
                db.Projects.Add(project);
                db.SaveChanges();
                return project.Id;
            }
        }

        public void UpdateProject(Project project)
        {
            using (var db = new DataContext(_connectionString))
            {
                db.Projects.Update(project);
                db.SaveChanges();
            }
        }

        public List<Project> GetProjects()
        {
            using (var db = new DataContext(_connectionString))
            {
                return db.Projects.Where(p => p.IsDeleted == false)
                    .Include(p => p.ProjectSuppliers)
                    .ThenInclude(p => p.Supplier).ToList();
            }
        }

        public Project GetProjectById(int id)
        {
            using (var db = new DataContext(_connectionString))
            {
                return db.Projects.FirstOrDefault(b => b.Id == id);
            }
        }

        // Dispose implemented as no-op above
    }
}
