using System.Collections.Generic;
using System.Threading.Tasks;

namespace FreelanceMarketplace.API.Services
{
    // Componente reutilizable: Interfaz genérica del repositorio de datos
    // Define las operaciones CRUD básicas para cualquier entidad del sistema
    // Permite intercambiar fácilmente el motor de base de datos sin modificar la lógica de negocio
    public interface IGenericRepository<T> where T : class
    {
        Task<IEnumerable<T>> GetAllAsync();     // Obtener todos los registros
        Task<T?> GetByIdAsync(int id);          // Obtener un registro por su ID
        Task AddAsync(T entity);                // Agregar un nuevo registro
        Task UpdateAsync(T entity);             // Actualizar un registro existente
        Task DeleteAsync(int id);               // Eliminar un registro por su ID
    }
}
