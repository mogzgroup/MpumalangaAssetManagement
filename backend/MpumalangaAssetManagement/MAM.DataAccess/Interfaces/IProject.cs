using MAM.DataAccess.Tables;
using System;
using System.Collections.Generic;

namespace MAM.DataAccess.Interfaces
{
    public interface IProject
    {
        int AddProject(Project project);
        void UpdateProject(Project project);
        List<Project> GetProjects();
        Project GetProjectById(int id);
    }
}
