import React from 'react';

export const UserPropType = React.PropTypes.shape({
    pk: React.PropTypes.number.isRequired,
    email: React.PropTypes.string.isRequired,
    firstName: React.PropTypes.string.isRequired,
    lastName: React.PropTypes.string.isRequired,
    can_see_prediction: React.PropTypes.boolean,
}).isRequired;
