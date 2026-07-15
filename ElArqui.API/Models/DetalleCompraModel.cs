// Models/DetalleCompraModel.cs
namespace ElArqui.API.Models
{
    public class DetalleCompraModel
    {
        public int IdDetalleCompra { get; set; }
        public int IdCompra { get; set; }
        public int IdProducto { get; set; }
        public decimal Cantidad { get; set; }
        public decimal PrecioUnitario { get; set; }
    }
}