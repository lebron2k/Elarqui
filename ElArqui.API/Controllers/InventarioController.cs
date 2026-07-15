using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using ElArqui.API.Models;
using ElArqui.API.Data;

namespace ElArqui.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InventarioController : ControllerBase
    {
        private readonly DbContext _context;
        public InventarioController(DbContext context)
        {
            _context = context;
        }

        //controlador obtener inventario
        [HttpGet]
public IActionResult GetInventario()
{
    var inventario = new List<InventarioModel>();
    try
    {
        using (var conn = _context.GetConnection())
        {
            conn.Open();
            var cmd = new SqlCommand(@"
                SELECT i.idProducto, p.nombre, i.stockActual, i.stockMinimo
                FROM Inventario i
                INNER JOIN Producto p ON i.idProducto = p.idProducto
                WHERE p.activo = 1
                ORDER BY p.nombre", conn);

            var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                inventario.Add(new InventarioModel
                {
                    IdProducto     = reader.GetInt32(0),
                    NombreProducto = reader.GetString(1),
                    StockActual    = reader.GetDecimal(2),
                    StockMinimo    = reader.GetDecimal(3)
                });
            }
        }
    }
    catch (Exception ex)
    {
        return StatusCode(500, ex.Message);
    }
    return Ok(inventario);
}

[HttpGet("{id}")]
public IActionResult GetInventarioById(int id)
{
    try
    {
        using (var conn = _context.GetConnection())
        {
            conn.Open();
            var cmd = new SqlCommand(@"
                SELECT i.idProducto, p.nombre, i.stockActual, i.stockMinimo
                FROM Inventario i
                INNER JOIN Producto p ON i.idProducto = p.idProducto
                WHERE i.idProducto = @id", conn);

            cmd.Parameters.AddWithValue("@id", id);
            var reader = cmd.ExecuteReader();

            if (reader.Read())
            {
                var inv = new InventarioModel
                {
                    IdProducto     = reader.GetInt32(0),
                    NombreProducto = reader.GetString(1),
                    StockActual    = reader.GetDecimal(2),
                    StockMinimo    = reader.GetDecimal(3)
                };
                return Ok(inv);
            }

            return NotFound("Producto no encontrado en inventario");
        }
    }
    catch (Exception ex)
    {
        return StatusCode(500, ex.Message);
    }
}

// Solo permite cambiar el stock mínimo/actual
[HttpPut("{id}")]
public IActionResult UpdateStockMinimo(int id, [FromBody] InventarioModel inventario)
{
    try
    {
        using (var conn = _context.GetConnection())
        {
            conn.Open();
            var cmd = new SqlCommand(@"
                UPDATE Inventario 
                SET stockMinimo = @stockMinimo , stockActual = @stockActual
                WHERE idProducto = @id", conn);

            cmd.Parameters.AddWithValue("@stockMinimo", inventario.StockMinimo);
            cmd.Parameters.AddWithValue("@stockActual", inventario.StockActual);
            cmd.Parameters.AddWithValue("@id", id);

            var rowsAffected = cmd.ExecuteNonQuery();
            if (rowsAffected == 0)
                return NotFound("Producto no encontrado en inventario");
        }

        return NoContent();
    }
    catch (Exception ex)
    {
        return StatusCode(500, ex.Message);
    }
}

[HttpGet("categoria/{idCategoria}")]
public IActionResult GetInventarioByCategoria(int idCategoria)
{
            try
            {
        var inventario = new List<InventarioModel>();
        using (var conn = _context.GetConnection())
        {            conn.Open();
            var cmd = new SqlCommand(@"
                SELECT i.idProducto, p.nombre, i.stockActual, i.stockMinimo
                FROM Inventario i
                INNER JOIN Producto p ON i.idProducto = p.idProducto
                WHERE p.idCategoria = @id AND p.activo = 1
                ORDER BY p.nombre", conn);
                
                cmd.Parameters.AddWithValue("@id", idCategoria);
                var reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    inventario.Add(new InventarioModel
                    {
                        IdProducto     = reader.GetInt32(0),
                        NombreProducto = reader.GetString(1),
                        StockActual    = reader.GetDecimal(2),
                        StockMinimo    = reader.GetDecimal(3)
                    });
                

                }
        }
        return Ok(inventario);
    }
catch (Exception ex)
{
    return StatusCode(500, ex.Message);




    }
}}}