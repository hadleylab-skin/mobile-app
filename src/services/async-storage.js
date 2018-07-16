import _ from 'lodash';
import { AsyncStorage } from 'react-native';


export function buildAsyncStorageService(name, dehydrate = _.identity) {
    return async (cursor) => {
        cursor.set('status', 'Loading');
        let result = await AsyncStorage.getItem(name);
        result = dehydrate(result);
        result = {
            data: result,
            status: 'Succeed',
        };
        cursor.set(result);
        return result;
    };
}


const KEY = '@MelanomaApp:selectedStudyPk';


export const getSavedCurrentStudyService = buildAsyncStorageService(
    KEY,
    (value) => {
        const studyPk = parseInt(value, 10);
        return _.isNumber(studyPk) && !_.isNaN(studyPk) ? studyPk : null;
    }
);


export async function saveCurrentStudy(studyPk) {
    await AsyncStorage.setItem(KEY, `${studyPk}`);
}


export async function hasSavedStudy() {
    return _.includes(await AsyncStorage.getAllKeys(), KEY);
}
