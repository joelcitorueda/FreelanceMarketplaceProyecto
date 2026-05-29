using System.Collections.Generic;

namespace FreelanceMarketplace.API.Utils
{
    
    public class ApiResponse<T>
    {
        public bool Success { get; set; }                             
        public string Message { get; set; } = string.Empty;          
        public T? Data { get; set; }                               
        public List<string> Errors { get; set; } = new List<string>(); 

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

    
    public class ApiResponse : ApiResponse<object>
    {
        public ApiResponse() : base() { }

        public ApiResponse(object data, string message = "") : base(data, message) { }

        public ApiResponse(string errorMessage, List<string>? errors = null) : base(errorMessage, errors) { }

        
        public static ApiResponse<T> Ok<T>(T data, string message = "")
        {
            return new ApiResponse<T>(data, message);
        }

        
        public static ApiResponse Ok(string message = "")
        {
            var response = new ApiResponse();
            response.Success = true;
            response.Message = message;
            return response;
        }

        
        public static ApiResponse<T> Fail<T>(string errorMessage, List<string>? errors = null)
        {
            return new ApiResponse<T>(errorMessage, errors);
        }

        
        public static ApiResponse Fail(string errorMessage, List<string>? errors = null)
        {
            return new ApiResponse(errorMessage, errors);
        }
    }
}
