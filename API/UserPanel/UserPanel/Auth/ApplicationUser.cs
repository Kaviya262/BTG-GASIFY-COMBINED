using Microsoft.AspNetCore.Identity;

namespace UserPanel.Auth
{
    public class ApplicationUser : IdentityUser
    {
        public Int32 UserId { get; set; } // This is the new column

        public string? RefreshToken { get; set; }
        public DateTime RefreshTokenExpiryTime { get; set; }
    }
}
