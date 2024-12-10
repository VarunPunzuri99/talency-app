import { api } from "./api.service";

// Countries 

export async function getCountries(): Promise<any[]> {
    try {
        const response: any = await api.get('countries/all', {
        });
        return response;
    } catch (error: any) {
        throw new Error(`Error while fetching countries`, error?.message)
    }
}


export async function getStatesByCountryName(countryId: string) {
    try {
        const response: any = await api.get(`countries/${countryId}/states`);
        return response;
    } catch (error: any) {
        console.error('Error fetching country by id:', error.message);
        throw new Error(`Error while fetching country by id`, error?.message)
    }
}