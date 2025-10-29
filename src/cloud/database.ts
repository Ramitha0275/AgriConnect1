export const setDataForUser = (userEmail: string, key: string, data: any): void => {
    try {
        const compoundKey = `agriconnect-${key}-${userEmail}`;
        localStorage.setItem(compoundKey, JSON.stringify(data));
    } catch (error) {
        console.error(`Failed to save data for key ${key} to local storage.`, error);
    }
};

export const getDataForUser = <T>(userEmail: string, key: string): T | null => {
    try {
        const compoundKey = `agriconnect-${key}-${userEmail}`;
        const storedData = localStorage.getItem(compoundKey);
        if (storedData) {
            return JSON.parse(storedData) as T;
        }
        return null;
    } catch (error) {
        console.error(`Failed to load data for key ${key} from local storage.`, error);
        return null;
    }
};