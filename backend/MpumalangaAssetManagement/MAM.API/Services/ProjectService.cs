using MAM.BusinessLayer.Models;
using MAM.BusinessLayer.Interfaces;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MAM.API.Services
{
    public interface IProjectService
    {
        List<Project> GetProjects();
        Project UpdateProject(Project project);
        bool DeleteProject(Project project);
        int AddProject(Project project);
    }

    public class ProjectService : IProjectService
    {
        private readonly AppSettings _appSettings;
        private readonly IProjectRepository _projectRepository;

        public ProjectService(IOptions<AppSettings> appSettings, IProjectRepository projectRepository)
        {
            _appSettings = appSettings.Value;
            _projectRepository = projectRepository;
        }

        public List<Project> GetProjects()
        {
            return _projectRepository.GetProjects();
        }
        public Project UpdateProject(Project project)
        {
            return _projectRepository.UpdateProject(project);
        }
        public bool DeleteProject(Project project)
        {
            return _projectRepository.DeleteProject(project);
        }
        public int AddProject(Project project)
        {
            return _projectRepository.AddProject(project);
        }
    }
}
