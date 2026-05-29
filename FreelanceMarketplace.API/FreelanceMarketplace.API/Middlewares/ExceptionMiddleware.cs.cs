using System;
using System.Collections.Generic;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using FreelanceMarketplace.API.Utils;

namespace FreelanceMarketplace.API.Middlewares
{
    
    public class ExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionMiddleware> _logger;

        public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        
        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context); 
            }
            catch (Exception ex)
            {
                
                _logger.LogError(ex, "Ocurrió una excepción no controlada durante la ejecución de la solicitud.");
                await HandleExceptionAsync(context, ex);
            }
        }

        
        private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

            var errors = new List<string> { exception.Message };
            if (exception.InnerException != null)
            {
                errors.Add(exception.InnerException.Message);
            }

            var apiResponse = ApiResponse.Fail("Ocurrió un error inesperado en el servidor.", errors);

            var options = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            };

            var jsonString = JsonSerializer.Serialize(apiResponse, options);
            await context.Response.WriteAsync(jsonString);
        }
    }
}
