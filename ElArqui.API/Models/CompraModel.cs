// Models/CompraModel.cs
namespace ElArqui.API.Models
{
    public class CompraModel
    {
        public int IdCompra { get; set; }
        public int IdProveedor { get; set; }
        public DateTime Fecha { get; set; }
        public decimal Total { get; set; }
        
        public List<DetalleCompraResponse> Detalles { get; set; }
        public string NombreProveedor { get; set; } // Propiedad para el nombre del proveedor
    }

    public class DetalleCompraResponse
{
    public string Producto { get; set; }
    public decimal Cantidad { get; set; }

    public string Medida { get; set; }
    public decimal PrecioUnitario { get; set; }
}
}