// Models/UsuarioModel.cs
namespace ElArqui.API.Models
{
    public class UsuarioModel
    {
        public int IdUsuario { get; set; }
        public string Nombre { get; set; }
        public string Email { get; set; }
        public string Contrasena { get; set; }
        public string Rol { get; set; }
    }
}