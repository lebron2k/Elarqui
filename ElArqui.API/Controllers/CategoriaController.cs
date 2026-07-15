using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using ElArqui.API.Models;
using ElArqui.API.Data;
using Microsoft.AspNetCore.Authorization;


namespace ElArqui.API.Controllers
{
    
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriasController : ControllerBase
    {
        private readonly DbContext _context;

        public CategoriasController(DbContext context)
        {
            _context = context;
        }

        // GET api/categorias
        [HttpGet]
        public IActionResult GetAll()
        {
            var categorias = new List<CategoriaModel>();

            try
            {
                using (var conn = _context.GetConnection())
                {
                    conn.Open();
                    var cmd = new SqlCommand("SELECT idCategoria, nombre FROM Categoria", conn);
                    var reader = cmd.ExecuteReader();

                    while (reader.Read())
                    {
                        categorias.Add(new CategoriaModel
                        {
                            IdCategoria = reader.GetInt32(0),
                            Nombre      = reader.GetString(1)
                        });
                    }
                }

                return Ok(categorias);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        // GET api/categorias/5
        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            try
            {
                using (var conn = _context.GetConnection())
                {
                    conn.Open();
                    var cmd = new SqlCommand("SELECT idCategoria, nombre FROM Categoria WHERE idCategoria = @id", conn);
                    cmd.Parameters.AddWithValue("@id", id);
                    var reader = cmd.ExecuteReader();

                    if (reader.Read())
                    {
                        var categoria = new CategoriaModel
                        {
                            IdCategoria = reader.GetInt32(0),
                            Nombre      = reader.GetString(1)
                        };
                        return Ok(categoria);
                    }

                    return NotFound("Categoría no encontrada");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        // POST api/categorias
        [HttpPost]
        public IActionResult Create(CategoriaModel model)
        {
            try
            {
                using (var conn = _context.GetConnection())
                {
                    conn.Open();
                    var cmd = new SqlCommand("INSERT INTO Categoria (nombre) VALUES (@nombre)", conn);
                    cmd.Parameters.AddWithValue("@nombre", model.Nombre);
                    cmd.ExecuteNonQuery();
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        // PUT api/categorias/5
        [HttpPut("{id}")]
        public IActionResult Update(int id, CategoriaModel model)
        {
            try
            {
                using (var conn = _context.GetConnection())
                {
                    conn.Open();
                    var cmd = new SqlCommand("UPDATE Categoria SET nombre = @nombre WHERE idCategoria = @id", conn);
                    cmd.Parameters.AddWithValue("@nombre", model.Nombre);
                    cmd.Parameters.AddWithValue("@id", id);
                    cmd.ExecuteNonQuery();
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        // DELETE api/categorias/5
     [HttpDelete("{id}")]
public IActionResult Delete(int id)
{
    try
    {
        using (var conn = _context.GetConnection())
        {
            conn.Open();
            var cmd = new SqlCommand(
                "DELETE FROM Categoria WHERE idCategoria = @id AND NOT EXISTS (SELECT 1 FROM Producto WHERE idCategoria = @id)",
                conn);
            cmd.Parameters.AddWithValue("@id", id);
            int filasAfectadas = cmd.ExecuteNonQuery();

            if (filasAfectadas == 0)
            {
                return Conflict("No se pudo eliminar: la categoría tiene productos asociados o no existe.");
            }
        }

        return NoContent();
    }
    catch (Exception ex)
    {
        return StatusCode(500, ex.Message);
    }
}
    }
}