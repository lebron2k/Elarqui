// Models/RegistrarVentaRequest.cs
namespace ElArqui.API.Models
{
    public class RegistrarVentaRequest
    {
        public int? IdCliente { get; set; }
        public int IdUsuario { get; set; }
        public int IdTipoDocumento { get; set; }
        public List<ProductoVentaRequest> Productos { get; set; }
    }

    public class ProductoVentaRequest
    {
        public int IdProducto { get; set; }
        public decimal Cantidad { get; set; }
        public decimal PrecioUnitario { get; set; }
        
    }
}