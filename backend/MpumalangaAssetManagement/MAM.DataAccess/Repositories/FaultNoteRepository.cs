using MAM.DataAccess.Interfaces;
using MAM.DataAccess.Tables;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;

namespace MAM.DataAccess.Repositories
{
    public class FaultNoteRepository : IFaultNote, IDisposable
    {
        // No unmanaged resources owned; keep no-op Dispose for compatibility with callers.

        private string _connectionString { get; set; }

        public FaultNoteRepository(string connectionString)
        {
            _connectionString = connectionString;
        }

        public int AddFaultNote(FaultNote note)
        {
            using (var db = new DataContext(_connectionString))
            {
                db.FaultNotes.Add(note);
                db.SaveChanges();
                return note.Id;
            }
        }

        public void UpdateFaultNote(FaultNote note)
        {
            using (var db = new DataContext(_connectionString))
            {
                db.FaultNotes.Update(note);
                db.SaveChanges();
            }
        }

        public List<FaultNote> GetFaultNotesByFaultId(int faultId)
        {
            using (var db = new DataContext(_connectionString))
            {
                return db.FaultNotes.Where(n => n.FaultId == faultId).ToList();
            }
        }
        
        public void DeleteFaultNotesByFaultId(int faultId)
        {
            using (var db = new DataContext(_connectionString))
            {
                var notes = GetFaultNotesByFaultId(faultId);
                db.FaultNotes.RemoveRange(notes);
                db.SaveChanges();
            }
        }

        public void Dispose()
        {
            // No resources to dispose. Method kept to preserve IDisposable compatibility.
        }
    }
}
