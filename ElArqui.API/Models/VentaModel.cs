// Models/VentaModel.cs
namespace ElArqui.API.Models
{
    public class VentaModel
    {
        public int IdVenta { get; set; }
        public int? IdCliente { get; set; }
        public string NombreCliente { get; set; }
        public int IdUsuario { get; set; }
        public int IdTipoDocumento { get; set; }
        public DateTime Fecha { get; set; }
        public decimal Subtotal { get; set; }
        public decimal Iva { get; set; }
        public decimal Total { get; set; }
        public string Correlativo { get; set; }
        public string Estado { get; set; }
        public List<DetalleVentaResponse> Detalles { get; set; }
    }

     public class DetalleVentaResponse
    {
        public string Producto { get; set; }
        public decimal Cantidad { get; set; }
        public string Medida { get; set; }
        public decimal PrecioUnitario { get; set; }
        public decimal SubtotalLinea { get; set; }
        public decimal IvaLinea { get; set; }
    }
}