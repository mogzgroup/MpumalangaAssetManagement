using MAM.BusinessLayer.Models;
using Microsoft.Win32.SafeHandles;
using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Text;

namespace MAM.BusinessLayer.Repositories
{
    public class CampRepository : IDisposable
    {
        private AppSettings appSettings { get; set; }
        // Flag: Has Dispose already been called?
        bool disposed = false;
        // Instantiate a SafeHandle instance.
        SafeHandle handle = new SafeFileHandle(IntPtr.Zero, true);

        public CampRepository(AppSettings settings)
        {
            appSettings = settings;
        }

        public List<Camp> GetCamps(string department)
        {
            Camp camp = new Camp();
            List<Camp> camps = new List<Camp>();
            using (var dataAccess = new DataAccess.Repositories.CampRepository(appSettings.ConnectionString))
            {
                var uamps = camp.ConvertToCamps(dataAccess.GetCamps(department));
                camps.AddRange(uamps);
                return camps;
            }
        }

        public void Dispose()
        {
            // Dispose of unmanaged resources.
            Dispose(true);
            // Suppress finalization.
            GC.SuppressFinalize(this);
        }

        // Protected implementation of Dispose pattern.
        protected virtual void Dispose(bool disposing)
        {
            if (disposed)
                return;

            if (disposing)
            {
                handle.Dispose();
                // Free any other managed objects here.
                //
            }

            disposed = true;
        }
    }
}
