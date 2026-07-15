using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using ElArqui.API.Models;
using ElArqui.API.Data;
using Microsoft.AspNetCore.Authorization;

namespace ElArqui.API.Controllers
{
     
    [ApiController]
    [Route("api/[controller]")]

    public class UnidadMedidaController : ControllerBase
    {
      private readonly  DbContext _context;

      public UnidadMedidaController(DbContext context)
      {
        _context = context;
      }

      [HttpGet]
      public IActionResult GetAll()
        {
            var unidades = new List<UnidadMedidaModel>();
            try
            {
              using(var conn= _context.GetConnection())
                {
                    conn.Open();
                    var cmd= new SqlCommand("SELECT idUnidadMedida, nombre, abreviacion FROM UnidadMedida", conn);
                    var reader = cmd.ExecuteReader();
                
                while(reader.Read())
                {
                    unidades.Add(new UnidadMedidaModel
                    {
                        IdUnidadMedida = reader.GetInt32(0),
                        Nombre = reader.GetString(1),
                        Abreviacion = reader.GetString(2)
                    });
                }
            }}
            catch(Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
            return Ok(unidades);
        }

    [HttpPut("{id}")]
    public IActionResult Update(int id,[FromBody]UnidadMedidaModel model)
    {
        try
        {
            using(var conn = _context.GetConnection())
            {
                conn.Open();
                var cmd = new SqlCommand("UPDATE UnidadMedida SET nombre = @nombre, abreviacion = @abreviacion WHERE idUnidadMedida = @id", conn);
                cmd.Parameters.AddWithValue("@nombre", model.Nombre);
                cmd.Parameters.AddWithValue("@abreviacion", model.Abreviacion);
                cmd.Parameters.AddWithValue("@id", id);
                var rowsAffected = cmd.ExecuteNonQuery();
                if(rowsAffected == 0)
                    return NotFound();
            }
        }
        catch(Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
        return NoContent();

    }

    [HttpDelete("{id}")]
    public IActionResult Delete(int id)
    {
        try
        {
            using(var conn = _context.GetConnection())
            {
                conn.Open();
                var cmd = new SqlCommand("DELETE FROM UnidadMedida WHERE idUnidadMedida = @id and not exists(select 1 from producto where idUnidadMedida=@id)", conn);
                cmd.Parameters.AddWithValue("@id", id);
               
               int filasAfectadas = cmd.ExecuteNonQuery();

            if (filasAfectadas == 0)
            {
                return Conflict("No se pudo eliminar: la unidad tiene productos asociados o no existe.");
            }
            }
        }
        catch(Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
        return NoContent();
    }

    [HttpPost]
    public IActionResult Create (UnidadMedidaModel model)
        {
            try{
                using(var conn=_context.GetConnection() )
                {
                    conn.Open();
                    var cmd=new SqlCommand("Insert into UnidadMedida (nombre,abreviacion) values (@nombre,@abreviacion)",conn);
                    cmd.Parameters.AddWithValue("@nombre",model.Nombre);
                    cmd.Parameters.AddWithValue("@abreviacion",model.Abreviacion);
                    cmd.ExecuteNonQuery();

               return NoContent();
                }}
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }


}
}