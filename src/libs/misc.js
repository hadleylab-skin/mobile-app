import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import { Alert } from 'react-native';
import PropTypes from 'prop-types';
import Permissions from 'react-native-permissions';


export const UserPropType = PropTypes.shape({
    pk: PropTypes.number.isRequired,
    email: PropTypes.string.isRequired,
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired,
    can_see_prediction: PropTypes.boolean,
}).isRequired;


export function convertInToCm(number) {
    const result = parseFloat(number) * 2.54;

    return `${result.toFixed(2)}`;
}

export function convertCmToIn(number) {
    const result = parseFloat(number) / 2.54;

    return `${result.toFixed(2)}`;
}

const defaultImageWidth = 320;
const defaultImageHeight = 480;

export function roundToIntegers(x) {
    return parseInt(x.toFixed(), 10);
}

export function convertMoleToSave(x, y, imageWidth, imageHeight) {
    const positionX = roundToIntegers((x / imageWidth) * defaultImageWidth);
    const positionY = roundToIntegers((y / imageHeight) * defaultImageHeight);

    return { positionX, positionY };
}

export function convertMoleToDisplay(x, y, imageWidth, imageHeight) {
    const positionX = roundToIntegers((x / defaultImageWidth) * imageWidth);
    const positionY = roundToIntegers((y / defaultImageHeight) * imageHeight);

    return { positionX, positionY };
}

export function isStudyConsentExpired(studies, currentStudyPk, patientPk) {
    if (currentStudyPk && studies) {
        const selectedStudy = _.find(studies, (study) => study.pk === currentStudyPk);
        if (selectedStudy && selectedStudy.patientsConsents && selectedStudy.patientsConsents[patientPk]) {
            const consentExpiredDate = selectedStudy.patientsConsents[patientPk].dateExpired;
            return moment(consentExpiredDate) < moment();
        }
    }

    return false;
}


export async function checkAndAskDeniedPhotoPermissions(permissions) {
    const result = await Permissions.checkMultiple(permissions);
    const allDisabled = _.every(_.values(result), (value) => value === 'denied');
    const accessTo = permissions.join(' and ').replace('photo', 'photos');
    if (allDisabled) {
        Alert.alert(
            `Skin can't access to your ${accessTo}?`,
            `You denied access to the ${accessTo}, it can be changed in settings`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Open Settings',
                    onPress: Permissions.openSettings,
                },
            ],
        );
    }
}
