// Models/DetalleVentaModel.cs
namespace ElArqui.API.Models
{
    public class DetalleVentaModel
    {
        public int IdDetalleVenta { get; set; }
        public int IdVenta { get; set; }
        public int IdProducto { get; set; }
        public decimal Cantidad { get; set; }
        public decimal PrecioUnitario { get; set; }
        public decimal IvaLinea { get; set; }
        public decimal SubtotalLinea { get; set; }
    }
}