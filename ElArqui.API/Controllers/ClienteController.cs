using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using ElArqui.API.Models;
using ElArqui.API.Data;

namespace ElArqui.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ClienteController : ControllerBase
    {
        private readonly DbContext _context;
        public ClienteController(DbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult GetClientes()
        {
            var clientes = new List<ClienteModel>();
            try
            {
                using (var conn = _context.GetConnection())
                {
                    conn.Open();
                    var cmd = new SqlCommand("SELECT idCliente, nombre, direccion,nit,nrc  FROM Cliente", conn);
                    var reader = cmd.ExecuteReader();
                    while (reader.Read())
                    {
                        clientes.Add(new ClienteModel
                        {
                            IdCliente = reader.GetInt32(0),
                            Nombre = reader.GetString(1),
                            Direccion = reader.GetString(2),
                            Nit = reader.GetString(3),
                            Nrc = reader.GetString(4)
                        });
                    }
                }
                return Ok(clientes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al obtener los clientes: {ex.Message}");
            }
        }

    [HttpPost]
    public IActionResult CreateCliente([FromBody] ClienteModel cliente)
        {
            try
            {
                using (var conn = _context.GetConnection())
                {
                    conn.Open();
                    var cmd = new SqlCommand("INSERT INTO Cliente (nombre, direccion, nit, nrc) VALUES (@nombre, @direccion, @nit, @nrc)", conn);
                    cmd.Parameters.AddWithValue("@nombre", cliente.Nombre);
                    cmd.Parameters.AddWithValue("@direccion", (object)cliente.Direccion ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@nit", (object)cliente.Nit ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@nrc", (object)cliente.Nrc ?? DBNull.Value);
                    cmd.ExecuteNonQuery();
                }
                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al crear el cliente: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public IActionResult UpdateCliente(int id, [FromBody] ClienteModel cliente)
        {
            try
            {
                using (var conn = _context.GetConnection())
                {
                    conn.Open();
                    var cmd = new SqlCommand("UPDATE Cliente SET nombre = @nombre, direccion = @direccion, nit = @nit, nrc = @nrc WHERE idCliente = @id", conn);
                    cmd.Parameters.AddWithValue("@id", id);
                    cmd.Parameters.AddWithValue("@nombre", cliente.Nombre);
                    cmd.Parameters.AddWithValue("@direccion", (object)cliente.Direccion ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@nit", (object)cliente.Nit ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@nrc", (object)cliente.Nrc ?? DBNull.Value);
                    cmd.ExecuteNonQuery();
                }
                return Ok();
            }
            catch (Exception ex)
            {
                 return StatusCode(500, ex.Message);
            }
        }
    }
}