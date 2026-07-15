using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using ElArqui.API.Models;
using ElArqui.API.Data; 

namespace ElArqui.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProveedorController : ControllerBase
    {
        
        private readonly DbContext _context;
        public ProveedorController(DbContext context)
        {
            _context = context;
        }


        [HttpGet]
        public IActionResult GetProveedores()
        {
            var proveedores = new List<ProveedorModel>();
            try
            {
                using (var conn = _context.GetConnection())
                {
                    conn.Open();
                    var cmd = new SqlCommand(
                        "SELECT idProveedor, nombre, telefono, nit FROM Proveedor",
                        conn);
                    var reader = cmd.ExecuteReader();
                    while (reader.Read())
                    {
                        proveedores.Add(new ProveedorModel
                        {
                            IdProveedor = reader.GetInt32(0),
                            Nombre = reader.GetString(1),
                            Telefono = reader.IsDBNull(2) ? null : reader.GetString(2),
                            Nit = reader.IsDBNull(3) ? null : reader.GetString(3)
                        });
                    }
                }
                return Ok(proveedores);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al obtener los proveedores: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public IActionResult GetProveedorById(int id)
        {
            try
            {
                using (var conn = _context.GetConnection())
                {
                    conn.Open();
                    var cmd = new SqlCommand(
                        "SELECT idProveedor, nombre, telefono, nit FROM Proveedor WHERE idProveedor = @Id",
                        conn);
                    cmd.Parameters.AddWithValue("@Id", id);
                    var reader = cmd.ExecuteReader();
                    if (reader.Read())
                    {
                        var proveedor = new ProveedorModel
                        {
                            IdProveedor = reader.GetInt32(0),
                            Nombre = reader.GetString(1),
                            Telefono = reader.IsDBNull(2) ? null : reader.GetString(2),
                            Nit = reader.IsDBNull(3) ? null : reader.GetString(3)
                        };
                        return Ok(proveedor);
                    }
                    return NotFound($"No se encontró el proveedor con ID {id}");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al obtener el proveedor: {ex.Message}");
            }
        }

        [HttpPost]
        public IActionResult CrearProveedor([FromBody] ProveedorModel request)
        {
            try
            {
                using (var conn = _context.GetConnection())
                {
                    conn.Open();
                    var cmd = new SqlCommand(
                        @"INSERT INTO Proveedor (nombre, telefono, nit)
                          OUTPUT INSERTED.idProveedor
                          VALUES (@Nombre, @Telefono, @Nit)",
                        conn);
                    cmd.Parameters.AddWithValue("@Nombre", request.Nombre);
                    cmd.Parameters.AddWithValue("@Telefono", (object?)request.Telefono ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@Nit", (object?)request.Nit ?? DBNull.Value);

                    var nuevoId = (int)cmd.ExecuteScalar();
                    return Ok(new { IdProveedor = nuevoId });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al crear el proveedor: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public IActionResult EditarProveedor(int id, [FromBody] ProveedorModel request)
        {
            try
            {
                using (var conn = _context.GetConnection())
                {
                    conn.Open();
                    var cmd = new SqlCommand(
                        @"UPDATE Proveedor
                          SET nombre = @Nombre, telefono = @Telefono, nit = @Nit
                          WHERE idProveedor = @Id",
                        conn);
                    cmd.Parameters.AddWithValue("@Id", id);
                    cmd.Parameters.AddWithValue("@Nombre", request.Nombre);
                    cmd.Parameters.AddWithValue("@Telefono", (object?)request.Telefono ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@Nit", (object?)request.Nit ?? DBNull.Value);

                    var filas = cmd.ExecuteNonQuery();
                    if (filas == 0) return NotFound($"No se encontró el proveedor con ID {id}");
                    return Ok();
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al editar el proveedor: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public IActionResult EliminarProveedor(int id)
        {
            try
            {
                using (var conn = _context.GetConnection())
                {
                    conn.Open();
                    var cmd = new SqlCommand("DELETE FROM Proveedor WHERE idProveedor = @Id", conn);
                    cmd.Parameters.AddWithValue("@Id", id);

                    var filas = cmd.ExecuteNonQuery();
                    if (filas == 0) return NotFound($"No se encontró el proveedor con ID {id}");
                    return Ok();
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al eliminar el proveedor: {ex.Message}");
            }
        }
    }
}