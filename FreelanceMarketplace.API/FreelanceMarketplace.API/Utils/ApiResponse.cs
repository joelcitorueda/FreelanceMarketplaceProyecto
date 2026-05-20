using System.Collections.Generic;

namespace FreelanceMarketplace.API.Utils
{
    // Componente reutilizable: Envoltura genérica de respuesta estándar del API
    // Garantiza que todas las respuestas HTTP tengan la misma estructura JSON
    // Campos: Success (éxito), Message (mensaje), Data (datos), Errors (lista de errores)
    public class ApiResponse<T>
    {
        public bool Success { get; set; }                              // Indica si la operación fue exitosa
        public string Message { get; set; } = string.Empty;           // Mensaje descriptivo del resultado
        public T? Data { get; set; }                                   // Datos de respuesta (tipo genérico)
        public List<string> Errors { get; set; } = new List<string>(); // Lista de errores si los hay

        public ApiResponse() { }

        // Constructor para respuestas exitosas con datos
        public ApiResponse(T data, string message = "")
        {
            Success = true;
            Message = message;
            Data = data;
        }

        // Constructor para respuestas de error
        public ApiResponse(string errorMessage, List<string>? errors = null)
        {
            Success = false;
            Message = errorMessage;
            Errors = errors ?? new List<string>();
        }
    }

    // Clase base no genérica con métodos estáticos de conveniencia
    // Permite crear respuestas rápidas con ApiResponse.Ok() y ApiResponse.Fail()
    public class ApiResponse : ApiResponse<object>
    {
        public ApiResponse() : base() { }

        public ApiResponse(object data, string message = "") : base(data, message) { }

        public ApiResponse(string errorMessage, List<string>? errors = null) : base(errorMessage, errors) { }

        // Crear respuesta exitosa con datos tipados
        public static ApiResponse<T> Ok<T>(T data, string message = "")
        {
            return new ApiResponse<T>(data, message);
        }

        // Crear respuesta exitosa sin datos
        public static ApiResponse Ok(string message = "")
        {
            var response = new ApiResponse();
            response.Success = true;
            response.Message = message;
            return response;
        }

        // Crear respuesta de error con datos tipados
        public static ApiResponse<T> Fail<T>(string errorMessage, List<string>? errors = null)
        {
            return new ApiResponse<T>(errorMessage, errors);
        }

        // Crear respuesta de error sin datos
        public static ApiResponse Fail(string errorMessage, List<string>? errors = null)
        {
            return new ApiResponse(errorMessage, errors);
        }
    }
}
