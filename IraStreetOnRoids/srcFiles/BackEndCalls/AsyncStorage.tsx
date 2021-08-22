import AsyncStorage from '@react-native-async-storage/async-storage';

export enum StoreKey {
    UserName,
    PersonalShopping,
    notificationToken,
}

export const storeData = async (key: StoreKey, value: any) => {
    try {
        await AsyncStorage.setItem(key.toString(), JSON.stringify(value))
        return true;
    } catch (e) {
        return false;
    }
}

export const getData = async (key: StoreKey) => {
    try {
        return await AsyncStorage.getItem(key.toString());
    } catch(e) {
        return null
    }
}

export const clearUserData = async () => {
    return AsyncStorage.removeItem(StoreKey.UserName.toString())
}