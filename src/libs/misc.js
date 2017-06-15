import React from 'react';

export const UserPropType = React.PropTypes.shape({
    pk: React.PropTypes.number.isRequired,
    email: React.PropTypes.string.isRequired,
    firstName: React.PropTypes.string.isRequired,
    lastName: React.PropTypes.string.isRequired,
    can_see_prediction: React.PropTypes.boolean,
}).isRequired;


export function convertInToCm(number) {
    const result = parseFloat(number) * 2.54;

    return `${result.toFixed(2)}`;
}

export function convertCmToIn(number) {
    const result = parseFloat(number) / 2.54;

    return `${result.toFixed(2)}`;
}
