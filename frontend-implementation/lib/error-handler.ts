/**
 * Centralized error handling utility
 * Provides user-friendly error messages instead of technical errors
 */

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Network errors
    if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
      return "Unable to connect to the server. Please check your internet connection and try again.";
    }
    
    // Timeout errors
    if (error.message.includes("timeout") || error.message.includes("Timeout")) {
      return "The request took too long to complete. Please try again.";
    }
    
    // 404 errors
    if (error.message.includes("404") || error.message.includes("Not Found")) {
      return "The requested resource was not found. Please verify the information and try again.";
    }
    
    // 401/403 errors
    if (error.message.includes("401") || error.message.includes("Unauthorized")) {
      return "Your session has expired. Please log in again.";
    }
    
    if (error.message.includes("403") || error.message.includes("Forbidden")) {
      return "You do not have permission to perform this action.";
    }
    
    // 500 errors
    if (error.message.includes("500") || error.message.includes("Internal Server Error")) {
      return "An internal server error occurred. Please try again later or contact support.";
    }
    
    // Validation errors
    if (error.message.includes("validation") || error.message.includes("ValidationError")) {
      return "Please check your input and ensure all required fields are filled correctly.";
    }
    
    // Generic error - don't expose technical details
    return "An unexpected error occurred. Please try again or contact support if the problem persists.";
  }
  
  if (typeof error === "string") {
    // If it's already a user-friendly message, return it
    return error;
  }
  
  // Fallback for unknown error types
  return "An unexpected error occurred. Please try again.";
}

export function handleApiError(error: unknown, defaultMessage?: string): string {
  const message = getErrorMessage(error);
  return defaultMessage || message;
}

/**
 * Logs error to console only in development mode
 */
export function logError(error: unknown, context?: string): void {
  if (process.env.NODE_ENV === "development") {
    if (context) {
      console.error(`[${context}]`, error);
    } else {
      console.error(error);
    }
  }
  // In production, errors should be sent to an error tracking service
  // Example: Sentry.captureException(error);
}

