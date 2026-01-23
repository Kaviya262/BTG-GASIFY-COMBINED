using Core.Abstractions;
using MySql.Data.MySqlClient;
using System.Data;

namespace UserPanel.Infrastructure.Data;
public class MySqlConnectionFactory : IMySqlConnectionFactoryDB1, IMySqlConnectionFactoryDB2, IFinaceDBConnection, IMasterDBConnection
{
    private readonly string _connectionString;

    public MySqlConnectionFactory(string connectionString)
    {
        _connectionString = connectionString;
    }

    public IDbConnection CreateConnection()
    {
        return new MySqlConnection(_connectionString);
    }
}