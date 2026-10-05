using System.ComponentModel.DataAnnotations;

namespace MAM.BusinessLayer.Models
{
    public class PasswordChangeModel
    {
        [Required]
        public string Username { get; set; }

        [Required]
        public string NewPassword { get; set; }

        [Required]
        public string OldPassword { get; set; }
    }
}
