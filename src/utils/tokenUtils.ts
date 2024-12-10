import Cookies from 'universal-cookie';
import { jwtDecode } from 'jwt-decode';

/**
 * Utility function to get the userId from the JWT token stored in cookies
 */
export const getUserIdFromToken = (): string | null => {
  const cookies = new Cookies();
  const token = cookies.get('talency_id_token');
  
  if (token) {
    try {
        const decodedToken: any = jwtDecode(token); // Decodes the JWT token into an object
        console.log('decodedToken',decodedToken)
      return decodedToken._id || null; // Return userId from decoded token, or null if not found
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null; // Return null if decoding fails
    }
  }
  
  console.log('Token not found in cookies');
  return null; // Return null if token is not found
};

export const getOrgIdFromToken = (): string | null => {
  const cookies = new Cookies();
  const token = cookies.get('talency_id_token');
  
  if (token) {
    try {
        const decodedToken: any = jwtDecode(token); // Decode the JWT token into an object
        console.log('decodedToken', decodedToken);
        return decodedToken.org || null; // Access the 'org' field from the decoded token
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null; // Return null if decoding fails
    }
  }
  
  console.log('Token not found in cookies');
  return null; // Return null if token is not found
};


/**
 * Utility function to set the access token in cookies
 */
export const setToken = (token: string): void => {
  const cookies = new Cookies();
  cookies.set('talency_id_token', token, { path: '/', maxAge: 3600 }); // Set the token with an expiration time (maxAge in seconds)
};

/**
 * Utility function to clear the token from cookies (e.g., on logout)
 */
export const clearToken = (): void => {
  const cookies = new Cookies();
  cookies.remove('talency_id_token', { path: '/' }); // Remove the token
};
