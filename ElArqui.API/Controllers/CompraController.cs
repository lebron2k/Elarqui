using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using ElArqui.API.Models;
using ElArqui.API.Data;
using System.Text.Json;
//importaciones necesarias para el controlador de compras, similar a las de categorias y productos
//namespace y clase del controlador de compras, siguiendo la misma estructura que los otros controladores
namespace ElArqui.API.Controllers
{
    //indicor que esta clase es un controlador de API y defino la ruta base para las solicitudes HTTP   
    [ApiController]
    [Route("api/[controller]")]

    public class CompraController :ControllerBase
    {
        private readonly DbContext _context;
        public CompraController(DbContext context)
        {
            _context = context;
        }

     //get de todas las compras
     [HttpGet]
     public IActionResult GetCompras()
        {
            var compras =new List<CompraModel>();
            try
            {
               using (var conn= _context.GetConnection())
               {
                conn.Open();
                var cmd = new SqlCommand("SELECT  c.idCompra,c.idProveedor, p.nombre as Proveedor, c.fecha, c.total FROM Compra c JOIN Proveedor p ON c.idProveedor = p.idProveedor", conn);
                var reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    compras.Add(new CompraModel
                    {
                        IdCompra = reader.GetInt32(0),
                        IdProveedor = reader.GetInt32(1),
                        NombreProveedor = reader.GetString(2),
                        Fecha = reader.GetDateTime(3),
                        Total = reader.GetDecimal(4)
                    });
                }
               }
               return Ok(compras);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al obtener las compras: {ex.Message}");
            }
        }

        [HttpPost]
        public IActionResult RegistrarCompra([FromBody]RegistrarCompraRequest request)
        {
            try
            {//abro conexion
               using(var conn= _context.GetConnection())
                {
                    conn.Open();
                    //serializo la lista de productos a JSON para enviarla al SP
                    var productosJson = JsonSerializer.Serialize(request.Productos, new JsonSerializerOptions
{
    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
});
                    

                     Console.WriteLine("JSON enviado: " + productosJson);


                    var cmd=new SqlCommand("sp_RegistrarCompra", conn);
                    cmd.CommandType= System.Data.CommandType.StoredProcedure;
                    //parametros del sp
                    cmd.Parameters.AddWithValue("@idProveedor", request.IdProveedor);
                    cmd.Parameters.AddWithValue("@productos", productosJson);

//parametros que devuelve el sp
                    var reader= cmd.ExecuteReader();
                    if (reader.Read())
                    {
                        var result= new
                        {
                            IdCompra = reader.GetInt32(0),
                            Total = reader.GetDecimal(1)
                        };
                        return Ok(result);
                    }
                   return StatusCode(500, "El SP no devolvió resultado");


                    
                } 
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al registrar la compra: {ex.Message}");
            }
        }

        //ver compras por id
        [HttpGet("{id}")]
        public IActionResult GetCompraById(int id)
        {
            var compra= new CompraModel();

            try
            {
                using(var conn=_context.GetConnection())
                {
                    conn.Open();
                    var cmd= new SqlCommand("SELECT c.idCompra, c.idProveedor, p.nombre as Proveedor, c.fecha, c.total FROM Compra c JOIN Proveedor p ON c.idProveedor = p.idProveedor WHERE c.idCompra = @IdCompra", conn);
                    cmd.Parameters.AddWithValue("@IdCompra", id);
                    var reader= cmd.ExecuteReader();
                    if(reader.Read())
                    {
                        compra= new CompraModel
                        {
                            IdCompra = reader.GetInt32(0),
                            IdProveedor = reader.GetInt32(1),
                            NombreProveedor = reader.GetString(2),
                            Fecha = reader.GetDateTime(3),
                            Total = reader.GetDecimal(4),
                            Detalles = new List<DetalleCompraResponse>()
                        };
//ahora obtengo los detalles de la compra
                        reader.Close();
                        var cmdDetalles= new SqlCommand("SELECT  p.nombre as Producto,u.nombre as Medida, d.cantidad, d.precioUnitario FROM DetalleCompra d JOIN Producto p ON d.idProducto = p.idProducto JOIN UnidadMedida u ON p.idUnidadMedida = u.idUnidadMedida WHERE d.idCompra = @IdCompra", conn);
                        cmdDetalles.Parameters.AddWithValue("@IdCompra", id);
                        var readerDetalles= cmdDetalles.ExecuteReader();
                        while(readerDetalles.Read())
                        {
                            compra.Detalles.Add(new DetalleCompraResponse
                            {
                                Producto = readerDetalles.GetString(0) ,
                                Medida = readerDetalles.GetString(1),
                                Cantidad = readerDetalles.GetDecimal(2),
                                PrecioUnitario = readerDetalles.GetDecimal(3)
                            });
                        }


                        return Ok(compra);
                    }
                    return NotFound($"No se encontró la compra con ID {id}");
                }

            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al obtener la compra: {ex.Message}");
            }
        }
        
    }
    
}