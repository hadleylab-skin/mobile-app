import React from 'react';
import PropTypes from 'prop-types';


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
