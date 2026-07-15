namespace ElArqui.API.Models
{
    public class VentaDetalleResponse
    {
        public int IdVenta { get; set; }
        public string Correlativo { get; set; }
        public DateTime Fecha { get; set; }
        public int? IdCliente { get; set; }
        public string NombreCliente { get; set; }
        public int IdTipoDocumento { get; set; }
        public decimal Subtotal { get; set; }
        public decimal Iva { get; set; }
        public decimal Total { get; set; }
        public string Estado { get; set; }
        public List<DetalleVentaResponse> Productos { get; set; }
    }
}