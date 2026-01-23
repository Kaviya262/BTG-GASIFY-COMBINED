using System.Data;

namespace UserPanel.Core.Abstractions;

public interface IUnitOfWork : IDisposable
{
    IDbConnection Connection { get; }
    IDbTransaction Transaction { get; }
    int Commit();
}
