import { isNetworkError, getErrorMessage } from '../../utils/errorHandler';

describe('Error Handler', () => {
  describe('isNetworkError', () => {
    it('should detect network errors', () => {
      expect(isNetworkError({ message: 'Network request failed' })).toBe(true);
      expect(isNetworkError({ message: 'fetch failed' })).toBe(true);
      expect(isNetworkError({ code: 'NETWORK_ERROR' })).toBe(true);
    });

    it('should not detect non-network errors', () => {
      expect(isNetworkError({ message: 'Some other error' })).toBe(false);
      expect(isNetworkError({ message: 'Validation failed' })).toBe(false);
      expect(isNetworkError({ code: 'VALIDATION_ERROR' })).toBe(false);
    });

    it('should handle undefined errors', () => {
      expect(isNetworkError(undefined)).toBe(false);
      expect(isNetworkError(null)).toBe(false);
    });
  });

  describe('getErrorMessage', () => {
    it('should return network error message for network errors', () => {
      const error = { message: 'Network request failed' };
      expect(getErrorMessage(error)).toBe('No hay conexión a internet. Por favor verifica tu conexión.');
    });

    it('should return response error message if available', () => {
      const error = {
        response: {
          data: {
            error: 'Custom error message'
          }
        }
      };
      expect(getErrorMessage(error)).toBe('Custom error message');
    });

    it('should return error message if available', () => {
      const error = { message: 'Error message' };
      expect(getErrorMessage(error)).toBe('Error message');
    });

    it('should return default message for unknown errors', () => {
      expect(getErrorMessage({})).toBe('Ocurrió un error inesperado.');
      expect(getErrorMessage(null)).toBe('Ocurrió un error inesperado.');
    });
  });
});
