using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using ElArqui.API.Models;
using ElArqui.API.Data;
using System.Text.Json;

using Microsoft.AspNetCore.Authorization;

namespace ElArqui.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VentaController : ControllerBase
    {
        private readonly DbContext _context;
        public VentaController(DbContext context)
        {
            _context = context;
        }

       //controlador obtener todas las ventas
       [HttpGet]
       public IActionResult GetVentas()
        {
           var ventas = new List<VentaModel>();
           try
           {
               // Lógica para obtener las ventas
               using(var conn= _context.GetConnection())
               {
                conn.Open();
                var cmd = new SqlCommand("SELECT v.idVenta, v.idCliente, c.nombre as NombreCliente, v.idUsuario, v.idTipoDocumento, v.fecha, v.subtotal, v.iva, v.total, v.correlativo, v.estado FROM Venta v LEFT JOIN Cliente c ON v.idCliente = c.idCliente", conn);
                var reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    ventas.Add(new VentaModel
                    {
                        IdVenta = reader.GetInt32(0),
                        IdCliente = reader.IsDBNull(1) ? (int?)null : reader.GetInt32(1),
                        NombreCliente = reader.IsDBNull(2) ? null : reader.GetString(2),
                        IdUsuario = reader.GetInt32(3),
                        IdTipoDocumento = reader.GetInt32(4),
                        Fecha = reader.GetDateTime(5),
                        Subtotal = reader.GetDecimal(6),
                        Iva = reader.GetDecimal(7),
                        Total = reader.GetDecimal(8),
                        Correlativo = reader.GetString(9),
                        Estado = reader.GetString(10)
                    });
                }
               }
           }
           catch (Exception ex)
           {
               return BadRequest(ex.Message);
           }
           return Ok(ventas);
        }

        //obtener ventas por id (cabecera + todos los productos)
        [HttpGet("{id}")]
        public IActionResult GetVentaById(int id)
        {
            try
            {
                using (var conn = _context.GetConnection())
                {
                    conn.Open();

                    // 1. Cabecera de la venta
                    VentaDetalleResponse venta = null;
                    var cmdVenta = new SqlCommand(
                        "SELECT v.idVenta, v.correlativo, v.fecha, v.idCliente, c.nombre AS NombreCliente, " +
                        "v.idTipoDocumento, v.subtotal, v.iva, v.total, v.estado " +
                        "FROM Venta v LEFT JOIN Cliente c ON v.idCliente = c.idCliente " +
                        "WHERE v.idVenta = @id", conn);
                    cmdVenta.Parameters.AddWithValue("@id", id);

                    using (var reader = cmdVenta.ExecuteReader())
                    {
                        if (reader.Read())
                        {
                            venta = new VentaDetalleResponse
                            {
                                IdVenta = reader.GetInt32(0),
                                Correlativo = reader.GetString(1),
                                Fecha = reader.GetDateTime(2),
                                IdCliente = reader.IsDBNull(3) ? (int?)null : reader.GetInt32(3),
                                NombreCliente = reader.IsDBNull(4) ? null : reader.GetString(4),
                                IdTipoDocumento = reader.GetInt32(5),
                                Subtotal = reader.GetDecimal(6),
                                Iva = reader.GetDecimal(7),
                                Total = reader.GetDecimal(8),
                                Estado = reader.GetString(9),
                                Productos = new List<DetalleVentaResponse>()
                            };
                        }
                    }

                    if (venta == null)
                        return NotFound();

                    // 2. Todos los renglones de producto de esa venta (while, no if)
                    var cmdDetalle = new SqlCommand(
                        "SELECT p.nombre, dv.cantidad, um.nombre, dv.precioUnitario, dv.subtotalLinea, dv.ivaLinea " +
                        "FROM DetalleVenta dv " +
                        "LEFT JOIN Producto p ON dv.idProducto = p.idProducto " +
                        "LEFT JOIN UnidadMedida um ON p.idUnidadMedida = um.idUnidadMedida " +
                        "WHERE dv.idVenta = @id", conn);
                    cmdDetalle.Parameters.AddWithValue("@id", id);

                    using (var readerDetalle = cmdDetalle.ExecuteReader())
                    {
                        while (readerDetalle.Read())
                        {
                            venta.Productos.Add(new DetalleVentaResponse
                            {
                                Producto = readerDetalle.GetString(0),
                                Cantidad = readerDetalle.GetDecimal(1),
                                Medida = readerDetalle.GetString(2),
                                PrecioUnitario = readerDetalle.GetDecimal(3),
                                SubtotalLinea = readerDetalle.GetDecimal(4),
                                IvaLinea = readerDetalle.GetDecimal(5)
                            });
                        }
                    }

                    return Ok(venta);
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        //registrar venta
        [HttpPost]
        public IActionResult RegistrarVenta([FromBody]RegistrarVentaRequest request)
        {
         try
            {
                using(var conn=_context.GetConnection())
                {
                    conn.Open();

                    var productosJson = JsonSerializer.Serialize(request.Productos, new JsonSerializerOptions
                    {
                        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                    });
                    var cmd =new SqlCommand("sp_RegistrarVenta", conn);
                    cmd.CommandType = System.Data.CommandType.StoredProcedure;

                    cmd.Parameters.AddWithValue("@IdCliente", request.IdCliente.HasValue ? (object)request.IdCliente.Value : DBNull.Value);
                    cmd.Parameters.AddWithValue("@IdUsuario", request.IdUsuario);
                    cmd.Parameters.AddWithValue("@IdTipoDocumento", request.IdTipoDocumento);
                    cmd.Parameters.AddWithValue("@Productos", productosJson);

                    var reader= cmd.ExecuteReader();
                    if (reader.Read())
                    {
                        var result = new
                        {
                            IdVenta = reader.GetInt32(0),
                            Correlativo = reader.GetString(1),
                            Total = reader.GetDecimal(2)
                            
                        };
                        return Ok(result);
                    }
                    return StatusCode(500, "El SP no devolvió resultado");
                }
            }
         catch (Exception ex)
         {
            return StatusCode(500, $"Error al registrar la venta: {ex.Message}");
         }
        }

        //anular venta
        [Authorize(Roles = "Admin")]
        [HttpPut("anular/{id}")]
        public IActionResult AnularVenta(int id)
        {
            try
            {
                using (var conn = _context.GetConnection())
                {
                    conn.Open();
                    var cmd = new SqlCommand("sp_AnularVenta", conn);
                    cmd.CommandType = System.Data.CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@IdVenta", id);
                    var reader = cmd.ExecuteReader();
                    if (reader.Read())
                    {
                        var result = new
                        {
                            IdVenta = reader.GetInt32(0),
                            Estado = reader.GetString(1)
                        };
                        if (result.Estado == "ANULADA")
                            return Ok(result);
                        else
                            return StatusCode(500, "No se pudo anular la venta");
                    }
                }
                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al anular la venta: {ex.Message}");
            }
        }

        //venta por mes
        [HttpPost("ventas-mes")]
        public IActionResult GetVentasPorMes([FromQuery] int anio, [FromQuery] int mes)
        {
            {
    try
    {
        using (var conn = _context.GetConnection())
        {
            conn.Open();
            var cmd = new SqlCommand("sp_LibroVentas", conn);
            cmd.CommandType = System.Data.CommandType.StoredProcedure;
            cmd.Parameters.AddWithValue("@anio", anio);
            cmd.Parameters.AddWithValue("@mes",  mes);

            var reader = cmd.ExecuteReader();
            var ventas = new List<object>();

            while (reader.Read())
            {
                ventas.Add(new
                {
                    idVenta       = reader.GetInt32(0),
                    correlativo   = reader.GetString(1),
                    fecha         = reader.GetDateTime(2),
                    subtotal      = reader.GetDecimal(3),
                    iva           = reader.GetDecimal(4),
                    total         = reader.GetDecimal(5),
                    estado        = reader.GetString(6),
                    cliente       = reader.IsDBNull(7) ? null : reader.GetString(7),
                    tipoDocumento = reader.GetString(8),
                    cajero        = reader.GetString(9)
                });
            }

            return Ok(ventas);
        }
    }
    catch (Exception ex)
    {
        return StatusCode(500, $"Error al obtener las ventas por mes: {ex.Message}");
    }
}
}

    }
}
