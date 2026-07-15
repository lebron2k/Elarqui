using Microsoft.Data.SqlClient;

namespace ElArqui.API.Data;

public class DbContext
{
    private readonly string _connectionString;

    public DbContext(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection");
    }

    public SqlConnection GetConnection()
    {
        return new SqlConnection(_connectionString);
    }
}
