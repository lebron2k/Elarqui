// Models/RegistrarCompraRequest.cs
namespace ElArqui.API.Models
{
    public class RegistrarCompraRequest
    {
        public int IdProveedor { get; set; }
        public List<ProductoCompraRequest> Productos { get; set; }
    }

    public class ProductoCompraRequest
    {
        public bool EsNuevo { get; set; }
        public int? IdProducto { get; set; }
        public string? Nombre { get; set; }
        public int? IdCategoria { get; set; }
        public int? IdUnidadMedida { get; set; }
        public decimal? Precio { get; set; }
        public bool? Iva { get; set; }
        public decimal? StockMinimo { get; set; }
        public decimal Cantidad { get; set; }
        public decimal PrecioUnitario { get; set; }
        

       
    }
}