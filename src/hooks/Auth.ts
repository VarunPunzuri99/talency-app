import { jwtDecode } from 'jwt-decode';

export default async function IsAuthenticated(token) {
    try {
        // console.log('token ====>', jwtDecode(token));
        const decodedData : any = jwtDecode(token);
        if (decodedData) {
            let userRole = null;
            if (decodedData.freelancer > 0) {
                userRole = 'freelancer';
            } else if (decodedData.company > 0) {
                userRole = 'company';
            } else if (decodedData.agency > 0) {
                userRole = 'agency';
            }
            return { authenticated: true, userRole };
        }
    } catch (error) {
        console.error('Error decoding token:', error.message);
    }

    return { authenticated: false, userRole: null };
}
