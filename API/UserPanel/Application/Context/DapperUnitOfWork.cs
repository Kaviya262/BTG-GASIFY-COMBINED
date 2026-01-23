using System.Data;
using Core.Abstractions;
using MySql.Data.MySqlClient;
using UserPanel.Core.Abstractions;

namespace UserPanel.Application.Context;

public class DapperUnitOfWork : IUnitOfWorkDB1, IUnitOfWorkDB2, IUnitOfWorkDB3 , IUnitOfWorkDB4
{
    private readonly IMySqlConnectionFactory _connectionFactory;
    private IDbConnection? _connection;
    private IDbTransaction? _transaction;
    private bool _disposed;

    public DapperUnitOfWork(IMySqlConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    // Return an open connection but do NOT start a transaction automatically.
    public IDbConnection Connection
    {
        get
        {
            if (_connection == null)
            {
                _connection = _connectionFactory.CreateConnection();
                _connection.Open();
                // do not begin transaction automatically - callers should call BeginTransaction when needed
            }
            return _connection;
        }
    }

    // Lazy transaction access (may be null if not started)
    public IDbTransaction Transaction
    {
        get
        {
            _ = Connection; // Ensures connection is initialized
            return _transaction!;
        }
    }

    // Explicitly start a transaction when needed
    public void BeginTransaction(IsolationLevel isolationLevel = IsolationLevel.ReadCommitted)
    {
        if (_connection == null)
            _connection = _connectionFactory.CreateConnection();

        if (_connection.State != ConnectionState.Open)
            _connection.Open();

        if (_transaction == null)
            _transaction = _connection.BeginTransaction(isolationLevel);
    }

    public int Commit()
    {
        if (_transaction == null) return 0;

        try
        {
            _transaction.Commit();
            return 1;
        }
        catch
        {
            try { _transaction.Rollback(); } catch { }
            return 0;
        }
        finally
        {
            _transaction.Dispose();
            _transaction = null; // do not automatically start a new transaction
        }
    }

    public void Dispose()
    {
        if (_disposed) return;

        // Do NOT auto-commit on dispose. If a transaction remains, roll it back to avoid locking.
        try
        {
            if (_transaction != null)
            {
                try { _transaction.Rollback(); } catch { }
                _transaction.Dispose();
                _transaction = null;
            }
        }
        finally
        {
            try { _connection?.Close(); } catch { }
            try { _connection?.Dispose(); } catch { }
            _connection = null;
            _disposed = true;
        }
    }
}