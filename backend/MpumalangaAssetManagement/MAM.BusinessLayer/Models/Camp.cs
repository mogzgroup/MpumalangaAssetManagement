using MAM.BusinessLayer.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace MAM.BusinessLayer.Models
{
    public class Camp
    {
        public int Id { get; set; }
        public string Status { get; set; }
        public string FileReference { get; set; }
        public int? OptimalSupportingAccommodationId { get; set; }
        public int UserId { get; set; }
        public DateTime CreatedDate { get; set; }
        public int ModifiedBy { get; set; }
        public DateTime ModifiedDate { get; set; }
        public string Department { get; set; }
        public User User { get; set; }

        public List<Camp> ConvertToCamps(List<DataAccess.Tables.Camp> campTbs)
        {
            List<Camp> camps = new List<Camp>();

            return (List<Camp>)campTbs.Select(c => new Camp()
            {
                Id = c.Id,
                Status = c.Status,
                FileReference = c.FileReference,
                OptimalSupportingAccommodationId = c.OptimalSupportingAccommodationId,
                UserId = c.UserId,
                CreatedDate = c.CreatedDate,
            });
        }
    }
}
