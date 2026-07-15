// Models/ClienteModel.cs
namespace ElArqui.API.Models
{
    public class ClienteModel
    {
        public int IdCliente { get; set; }
        public string Nombre { get; set; }
        public string? Direccion { get; set; }
        public string? Nit { get; set; }
        public string? Nrc { get; set; }
    }
}