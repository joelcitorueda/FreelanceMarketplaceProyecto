using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;

namespace FreelanceMarketplace.API.Services
{
    public class InMemoryRepository<T> : IGenericRepository<T> where T : class
    {
        private readonly List<T> _entities = new();
        private int _currentId = 1;

        public Task<IEnumerable<T>> GetAllAsync()
        {
            return Task.FromResult<IEnumerable<T>>(_entities.OrderBy(e => GetIdValue(e)));
        }

        public Task<T?> GetByIdAsync(int id)
        {
            var entity = _entities.FirstOrDefault(e => GetIdValue(e) == id);
            return Task.FromResult(entity);
        }

        public Task AddAsync(T entity)
        {
            // Set primary key dynamically if it is 0
            if (GetIdValue(entity) == 0)
            {
                SetIdValue(entity, _currentId++);
            }
            _entities.Add(entity);
            return Task.CompletedTask;
        }

        public Task UpdateAsync(T entity)
        {
            var id = GetIdValue(entity);
            var existing = _entities.FirstOrDefault(e => GetIdValue(e) == id);
            if (existing != null)
            {
                _entities.Remove(existing);
                _entities.Add(entity);
            }
            return Task.CompletedTask;
        }

        public Task DeleteAsync(int id)
        {
            var existing = _entities.FirstOrDefault(e => GetIdValue(e) == id);
            if (existing != null)
            {
                _entities.Remove(existing);
            }
            return Task.CompletedTask;
        }

        private static int GetIdValue(T entity)
        {
            var prop = typeof(T).GetProperty("Id");
            if (prop != null)
            {
                var val = prop.GetValue(entity);
                if (val is int intVal) return intVal;
            }
            return 0;
        }

        private static void SetIdValue(T entity, int id)
        {
            var prop = typeof(T).GetProperty("Id");
            if (prop != null && prop.CanWrite)
            {
                prop.SetValue(entity, id);
            }
        }
    }
}
