import React from 'react';
import _ from 'lodash';
import BaobabPropTypes from 'baobab-prop-types';
import {
    View,
    Image,
} from 'react-native';
import TouchableArea from '../touchable-area';
import s from './styles';

import front from './images/front/front.png';
import head from './images/body/head/head.png';
import neck from './images/body/neck/neck.png';

import rightChest from './images/body/right-chest/right-chest.png';
import leftChest from './images/body/left-chest/left-chest.png';
import upperRightPelvis from './images/body/upper-right-pelvis/upper-right-pelvis.png';
import upperLeftPelvis from './images/body/upper-left-pelvis/upper-left-pelvis.png';
import lowerRightPelvis from './images/body/lower-right-pelvis/lower-right-pelvis.png';
import lowerLeftPelvis from './images/body/lower-left-pelvis/lower-left-pelvis.png';

import leftShoulder from './images/arms/left-shoulder/left-shoulder.png';
import rightShoulder from './images/arms/right-shoulder/right-shoulder.png';
import rightElbow from './images/arms/right-elbow/right-elbow.png';
import leftElbow from './images/arms/left-elbow/left-elbow.png';
import rightForearm from './images/arms/right-forearm/right-forearm.png';
import leftForearm from './images/arms/left-forearm/left-forearm.png';
import rightWrist from './images/arms/right-wrist/right-wrist.png';
import leftWrist from './images/arms/left-wrist/left-wrist.png';
import rightHand from './images/arms/right-hand/right-hand.png';
import leftHand from './images/arms/left-hand/left-hand.png';

const sites = [
    {
        label: 'Head',
        styles: s.head,
        source: head,
    },
    {
        label: 'Right Shoulder',
        styles: s.rightShoulder,
        source: rightShoulder,
    },
    {
        label: 'Right Chest',
        styles: s.rightChest,
        source: rightChest,
    },
    {
        label: 'Left Shoulder',
        styles: s.leftShoulder,
        source: leftShoulder,
    },
    {
        label: 'Left Chest',
        styles: s.leftChest,
        source: leftChest,
    },
    {
        label: 'Neck',
        styles: s.neck,
        source: neck,
    },
    {
        label: 'Upper Right Pelvis',
        styles: s.upperRightPelvis,
        source: upperRightPelvis,
    },
    {
        label: 'Upper Left Pelvis',
        styles: s.upperLeftPelvis,
        source: upperLeftPelvis,
    },
    {
        label: 'Lower Right Pelvis',
        styles: s.lowerRightPelvis,
        source: lowerRightPelvis,
    },
    {
        label: 'Lower Left Pelvis',
        styles: s.lowerLeftPelvis,
        source: lowerLeftPelvis,
    },
    {
        label: 'Right Elbow',
        styles: s.rightElbow,
        source: rightElbow,
    },
    {
        label: 'Left Elbow',
        styles: s.leftElbow,
        source: leftElbow,
    },
    {
        label: 'Right Forearm',
        styles: s.rightForearm,
        source: rightForearm,
    },
    {
        label: 'Left Forearm',
        styles: s.leftForearm,
        source: leftForearm,
    },
    {
        label: 'Right Wrist',
        styles: s.rightWrist,
        source: rightWrist,
    },
    {
        label: 'Left Wrist',
        styles: s.leftWrist,
        source: leftWrist,
    },
    {
        label: 'Right Hand',
        styles: s.rightHand,
        source: rightHand,
    },
    {
        label: 'Left Hand',
        styles: s.leftHand,
        source: leftHand,
    },
];

const HumanFrontSide = React.createClass({
    displayName: 'HumanFrontSide',

    propTypes: {
        cursor: BaobabPropTypes.cursor.isRequired,
    },

    render() {
        const { cursor } = this.props;

        return (
            <View>
                <Image source={front} style={{ opacity: 0.5 }} />
                {_.map(sites, (site, index) =>
                    <TouchableArea
                        key={index}
                        cursor={cursor}
                        label={site.label}
                        styles={site.styles}
                        source={site.source}
                    />
                )}
            </View>
        );
    },
});

export default HumanFrontSide;
