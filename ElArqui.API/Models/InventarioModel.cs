// Models/InventarioModel.cs
namespace ElArqui.API.Models
{
    public class InventarioModel
    {

        public int IdProducto { get; set; }
        public decimal StockActual { get; set; }
        public decimal StockMinimo { get; set; }

        public string? NombreProducto { get; set; }
    }

    
}