


   
namespace ElArqui.API.Models
{
    public class ProductoModel
    {
        public int IdProducto { get; set; }
        public string? Codigo { get; set; }
        public string Nombre { get; set; }
        public int IdCategoria { get; set; }
        
        public int IdUnidadMedida { get; set; }
        public decimal Precio { get; set; }
        public bool Iva { get; set; }
        public bool Activo { get; set; }
         public decimal StockMinimo { get; set; }

         public decimal StockActual { get; set; }
         public string? Categoria { get; set; }
    }
}
