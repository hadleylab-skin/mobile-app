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
const KEY_TUTORIAL = '@MelanomaApp:tutorialPassed';


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


export function getTutorialPassedFlag(cursor, doctorPk) {
    const key = `${KEY_TUTORIAL}_${doctorPk}`;

    const _service = buildAsyncStorageService(key);
    return _service(cursor);
}


export async function setTutorialPassed(doctorPk) {
    await AsyncStorage.setItem(`${KEY_TUTORIAL}_${doctorPk}`, '1');
}
