export const cleanData = (data: any) => {

    Object.keys(data).forEach((key) => {
        const value = data[key];

        if (
            value === '' || value === null || value === 0 ||
            (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) || // Empty object
            (Array.isArray(value) && value.length === 0) ||
            (typeof value === 'number' && isNaN(value))
        ) {
            delete data[key]; // Delete unwanted data
        } else if (typeof value === 'object' && !Array.isArray(value)) {
            cleanData(value); // Recursively clean nested objects
        }
    });
};
