// frontend/src/utils/errorHandler.js
export const handleApiError = (error) => {
    let errorMessage = 'An unexpected error occurred';
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      errorMessage = error.response.data?.msg || error.response.statusText;
    } else if (error.request) {
      // The request was made but no response was received
      errorMessage = 'No response from server. Please check your connection.';
    } else {
      // Something happened in setting up the request
      errorMessage = error.message;
    }
    
    return errorMessage;
  };
  
  export const handleSuccess = (message) => {
    // You can integrate with a notification system here
    console.log('Success:', message);
    return { success: true, message };
  };