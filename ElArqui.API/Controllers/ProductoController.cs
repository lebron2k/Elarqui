using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using ElArqui.API.Models;
using ElArqui.API.Data;
using Microsoft.AspNetCore.Identity;

namespace ElArqui.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]

    public class ProductoController : ControllerBase
    {
        private readonly DbContext _context;
        public ProductoController(DbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            var productos = new List<ProductoModel>();

          try
            {
               using( var conn = _context.GetConnection()){
                conn.Open();
                var cmd = new SqlCommand(@"
                SELECT p.idProducto, p.codigo, p.nombre,p.idCategoria, c.nombre AS nombreCategoria, 
                       p.idUnidadMedida, p.precio, p.iva, p.activo
                FROM Producto p
                JOIN Categoria c ON p.idCategoria = c.idCategoria
                ", conn);
                var reader = cmd.ExecuteReader();
                while(reader.Read())
                {
                    productos.Add(new ProductoModel
                    {
                        IdProducto = reader.GetInt32(0),
                        Codigo = reader.IsDBNull(1) ? null : reader.GetString(1),
                        Nombre = reader.GetString(2),
                        IdCategoria = reader.GetInt32(3),
                        Categoria = reader.GetString(4),
                        IdUnidadMedida = reader.GetInt32(5),
                        Precio = reader.GetDecimal(6),
                        Iva = reader.GetBoolean(7),
                        Activo = reader.GetBoolean(8)
                    });
                }
                return Ok(productos);
            }}
            
            catch(Exception ex)
            {
                return StatusCode(500, ex.Message);
            }   
            
        }

       [HttpPost]
public IActionResult Create([FromBody] ProductoModel producto)
{
    try
    {
        using (var conn = _context.GetConnection())
        {
            conn.Open();

            // Insertar producto y obtener su id
            var cmd = new SqlCommand(@"
                INSERT INTO Producto (codigo, nombre, idCategoria, idUnidadMedida, precio, iva, activo)
                VALUES (@codigo, @nombre, @idCategoria, @idUnidadMedida, @precio, @iva, 1);
                SELECT SCOPE_IDENTITY();", conn);

            cmd.Parameters.AddWithValue("@codigo",         producto.Codigo ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@nombre",         producto.Nombre);
            cmd.Parameters.AddWithValue("@idCategoria",    producto.IdCategoria);
            cmd.Parameters.AddWithValue("@idUnidadMedida", producto.IdUnidadMedida);
            cmd.Parameters.AddWithValue("@precio",         producto.Precio);
            cmd.Parameters.AddWithValue("@iva",            producto.Iva);

            var idProducto = Convert.ToInt32(cmd.ExecuteScalar());

            // Crear registro en inventario
            var cmdInventario = new SqlCommand(@"
                INSERT INTO Inventario (idProducto, stockActual, stockMinimo)
                VALUES (@idProducto, 0, @stockMinimo)", conn);

            cmdInventario.Parameters.AddWithValue("@idProducto",  idProducto);
            cmdInventario.Parameters.AddWithValue("@stockMinimo", producto.StockMinimo);

            cmdInventario.ExecuteNonQuery();
        }

        return Ok("Producto creado correctamente");
    }
    catch (Exception ex)
    {
        return StatusCode(500, ex.Message);
    }
}
    
    [HttpPut("{id}")]
    public IActionResult Update(int id, [FromBody] ProductoModel producto)
    {
        try
        {
            using (var conn = _context.GetConnection())
            {
                conn.Open();
                var cmd = new SqlCommand(@"
                    UPDATE Producto 
                    SET codigo = @codigo, nombre = @nombre, idCategoria = @idCategoria, 
                        idUnidadMedida = @idUnidadMedida, precio = @precio, iva = @iva, activo=@activo
                    WHERE idProducto = @id", conn);

                cmd.Parameters.AddWithValue("@codigo",         producto.Codigo ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@nombre",         producto.Nombre);
                cmd.Parameters.AddWithValue("@idCategoria",    producto.IdCategoria);
                cmd.Parameters.AddWithValue("@idUnidadMedida", producto.IdUnidadMedida);
                cmd.Parameters.AddWithValue("@precio",         producto.Precio);
                cmd.Parameters.AddWithValue("@iva",            producto.Iva);
                cmd.Parameters.AddWithValue("@id",             id);
                cmd.Parameters.AddWithValue("@activo",         producto.Activo);

                var rowsAffected = cmd.ExecuteNonQuery();
                if (rowsAffected == 0)
                    return NotFound("Producto no encontrado");

                
                // Actualizar stock mínimo en inventario
                var cmdInventario = new SqlCommand(@"
                    UPDATE Inventario 
                    SET stockMinimo = @stockMinimo 
                    WHERE idProducto = @idProducto", conn);
                cmdInventario.Parameters.AddWithValue("@stockMinimo", producto.StockMinimo);
                cmdInventario.Parameters.AddWithValue("@idProducto", id);
                cmdInventario.ExecuteNonQuery();

            }

            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(int id)
    {
        try
        {
            using (var conn = _context.GetConnection())
            {
                conn.Open();
                var cmd = new SqlCommand("UPDATE Producto SET activo = 0 WHERE idProducto = @id", conn);
                cmd.Parameters.AddWithValue("@id", id);
                var rowsAffected = cmd.ExecuteNonQuery();
                if (rowsAffected == 0)
                    return NotFound("Producto no encontrado");

                    var cmdInventario = new SqlCommand("UPDATE Inventario SET stockActual = 0 WHERE idProducto = @idProducto", conn);
                    cmdInventario.Parameters.AddWithValue("@idProducto", id);
            }
            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }

//BUSCAR PRODUCTO POR ID
    [HttpGet("{id}")]
    public IActionResult GetById(int id)
    {
        try
            {
                using (var conn = _context.GetConnection())
                {
                    conn.Open();
                    var cmd = new SqlCommand(@"
                        SELECT p.idProducto, p.codigo, p.nombre, c.nombre as nombreCategoria,
                               p.idUnidadMedida, p.precio, p.iva, p.activo,
                               i.stockMinimo
                        FROM Producto p
                        INNER JOIN Inventario i ON p.idProducto = i.idProducto
                        INNER JOIN Categoria c ON p.idCategoria = c.idCategoria
                        WHERE p.idProducto = @id AND p.activo = 1", conn);
                    cmd.Parameters.AddWithValue("@id", id);
                    var reader = cmd.ExecuteReader();
                    if (reader.Read())
                    {
                        var producto = new ProductoModel
                        {
                            IdProducto = reader.GetInt32(0),
                            Codigo = reader.IsDBNull(1) ? null : reader.GetString(1),
                            Nombre = reader.GetString(2),
                            Categoria = reader.GetString(3),
                            
                            IdUnidadMedida = reader.GetInt32(4),
                            Precio = reader.GetDecimal(5),
                            Iva = reader.GetBoolean(6),
                            Activo = reader.GetBoolean(7),
                            StockMinimo = reader.GetDecimal(8)
                        };
                        return Ok(producto);
                    }
                
                
                    return NotFound("Producto no encontrado");  
                }

            }
         catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
    }

//BUSCAR PRODUCTO POR STOCK MINIMO
    [HttpGet("stockminimo")]
    public IActionResult GetByStockMinimo()
    {
        var productos = new List<ProductoModel>();

        try
        {
            using (var conn = _context.GetConnection())
            {
                conn.Open();
                var cmd = new SqlCommand(@"
                    SELECT p.idProducto, p.codigo, p.nombre, p.idCategoria, 
                           p.idUnidadMedida, p.precio, p.iva, p.activo,
                           i.stockActual, i.stockMinimo
                    FROM Producto p
                    INNER JOIN Inventario i ON p.idProducto = i.idProducto
                    WHERE i.stockActual <= i.stockMinimo AND p.activo = 1", conn);
                var reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    productos.Add(new ProductoModel
                    {
                        IdProducto = reader.GetInt32(0),
                        Codigo = reader.IsDBNull(1) ? null : reader.GetString(1),
                        Nombre = reader.GetString(2),
                        IdCategoria = reader.GetInt32(3),
                        IdUnidadMedida = reader.GetInt32(4),
                        Precio = reader.GetDecimal(5),
                        Iva = reader.GetBoolean(6),
                        Activo = reader.GetBoolean(7),
                        StockMinimo = reader.GetDecimal(8),
                        StockActual = reader.GetDecimal(9)
                    });
                }
                return Ok(productos);
            }
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
}

//Buscar por catergoria
[HttpGet("categoria/{idCategoria}")]
public IActionResult GetByCategoria(int idCategoria)
        {
            try
            {
                using (var conn=_context.GetConnection())
                {
                    conn.Open();
                    var cmd = new SqlCommand(@"
                        SELECT p.idProducto, p.codigo, p.nombre, c.nombre as nombreCategoria, 
                               p.idUnidadMedida, p.precio, p.iva, p.activo,
                               i.stockMinimo
                        FROM Producto p
                        INNER JOIN Inventario i ON p.idProducto = i.idProducto
                        INNER JOIN Categoria c ON p.idCategoria = c.idCategoria
                        WHERE p.idCategoria = @idCategoria AND p.activo = 1", conn);
                    cmd.Parameters.AddWithValue("@idCategoria", idCategoria);
                    var reader = cmd.ExecuteReader();
                    var productos = new List<ProductoModel>();
                    while (reader.Read())
                    {
                        productos.Add(new ProductoModel
                        {
                            IdProducto = reader.GetInt32(0),
                            Codigo = reader.IsDBNull(1) ? null : reader.GetString(1),
                            Nombre = reader.GetString(2),
                            Categoria = reader.GetString(3),
                            IdUnidadMedida = reader.GetInt32(4),
                            Precio = reader.GetDecimal(5),
                            Iva = reader.GetBoolean(6),
                            Activo = reader.GetBoolean(7),
                            StockMinimo = reader.GetDecimal(8)
                        });
                    }
                    return Ok(productos);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
                }
        }



}}