using System.ComponentModel.DataAnnotations;



   namespace ElArqui.API.Models
{
    public class UnidadMedidaModel
    {
        public int IdUnidadMedida { get; set; }
        public string Nombre { get; set; }
        public string Abreviacion { get; set; }
    }
}