using MAM.BusinessLayer.Interfaces;
using MAM.BusinessLayer.Model;
using MAM.BusinessLayer.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace MAM.BusinessLayer.Repositories
{
    public class ProjectRepository: IProjectRepository
    {
        private AppSettings appSettings { get; set; }
        private readonly MAM.DataAccess.Interfaces.IProject _projectDataAccess;
        private readonly MAM.DataAccess.Interfaces.IProjectSupplier _projectSupplierDataAccess;

        public ProjectRepository(AppSettings settings, MAM.DataAccess.Interfaces.IProject projectDataAccess, MAM.DataAccess.Interfaces.IProjectSupplier projectSupplierDataAccess)
        {
            appSettings = settings;
            _projectDataAccess = projectDataAccess;
            _projectSupplierDataAccess = projectSupplierDataAccess;
        }
        public List<Project> GetProjects()
        {
            Project Project = new Project();
            List<Project> projects = Project.ConvertToProjects(_projectDataAccess.GetProjects());
            return projects;
        }
        public Project UpdateProject(Project project)
        {
            _projectDataAccess.UpdateProject(project.ConvertToProjectTable(project));
            AddUpdateProjectSupplier(project);
            return project;
        }

        public void AddUpdateProjectSupplier(Project project)
        {
            foreach (var projectSupplier in project.ProjectSuppliers)
            {
                if (projectSupplier.Id > 0)
                {
                    _projectSupplierDataAccess.UpdateProjectSupplier(projectSupplier.ConvertToProjectSupplierTable(projectSupplier));
                }
                else {
                    _projectSupplierDataAccess.AddProjectSupplier(projectSupplier.ConvertToProjectSupplierTable(projectSupplier));
                }
            }
        }

        public bool DeleteProject(Project project)
        {
            project.IsDeleted = true;
            _projectDataAccess.UpdateProject(project.ConvertToProjectTable(project));
            return true;
        }

        public bool DeleteProjectSupplier(int projectId)
        {
            _projectSupplierDataAccess.DeleteProjectSupplierById(projectId);
            return true;
        }

        public int AddProject(Project project)
        {
            return _projectDataAccess.AddProject(project.ConvertToProjectTable(project));
        }

        // Business-layer repository does not hold unmanaged resources; leave disposal to data-access.
    }
}
