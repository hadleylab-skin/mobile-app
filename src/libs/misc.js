import React from 'react';

export const UserPropType = React.PropTypes.shape({
    id: React.PropTypes.number.isRequired,
    email: React.PropTypes.string.isRequired,
    firstname: React.PropTypes.string.isRequired,
    lastname: React.PropTypes.string.isRequired,
    can_see_prediction: React.PropTypes.boolean,
}).isRequired;
