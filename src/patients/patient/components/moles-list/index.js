import React from 'react';
import _ from 'lodash';
import {
    View,
} from 'react-native';
import { Title } from 'components/new/title';
import { Mole } from './mole';

import moleImage from './images/mole.png';

const molesData = [
    {
        category: 'head',
        title: 'Left Ear Helix',
        dateModified: '2017-04-06',
        images: [
            {
                photo: moleImage,
                dateCreated: '2017-04-06',
            },
            {
                photo: moleImage,
                dateCreated: '2017-04-06',
            },
        ],
        clinicalDiagnosis: 'Clinical Diagnosis goes here',
        isClinicalDiagnosisBad: false,
    },
    {
        category: 'back',
        title: 'Right Mid Upper Back',
        dateModified: '2017-05-24',
        images: [
            {
                photo: moleImage,
                dateCreated: '2017-05-29',
            },
        ],
        clinicalDiagnosis: 'Clinical Diagnosis goes here',
        isClinicalDiagnosisBad: false,
    },
    {
        category: 'head',
        title: 'right nasal sidewall',
        dateModified: '2017-05-29',
        images: [
            {
                photo: moleImage,
                dateCreated: '2017-05-29',
            },
        ],
    },
    {
        category: 'arms',
        title: 'upper Forearm',
        dateModified: '2017-05-24',
        images: [
            {
                photo: moleImage,
                dateCreated: '2017-05-29',
            },
        ],
        clinicalDiagnosis: 'Clinical Diagnosis goes here',
        isClinicalDiagnosisBad: false,
    },
    {
        category: 'head',
        title: 'Rigth Ear Lobe',
        dateModified: '2017-05-24',
        images: [
            {
                photo: moleImage,
                dateCreated: '2017-05-24',
            },
            {
                photo: moleImage,
                dateCreated: '2017-05-24',
            },
            {
                photo: moleImage,
                dateCreated: '2017-05-24',
            },
        ],
        clinicalDiagnosis: 'Desmoplastic Melanoma',
        isClinicalDiagnosisBad: true,
    },
    {
        category: 'head',
        title: 'Left Ear Helix',
        dateModified: '2017-04-06',
        images: [
            {
                photo: moleImage,
                dateCreated: '2017-04-06',
            },
            {
                photo: moleImage,
                dateCreated: '2017-04-06',
            },
        ],
        clinicalDiagnosis: 'Clinical Diagnosis goes here',
        isClinicalDiagnosisBad: false,
    },
    {
        category: 'back',
        title: 'Right Mid Upper Back',
        dateModified: '2017-05-24',
        images: [
            {
                photo: moleImage,
                dateCreated: '2017-05-29',
            },
        ],
        clinicalDiagnosis: 'Clinical Diagnosis goes here',
        isClinicalDiagnosisBad: false,
    },
    {
        category: 'head',
        title: 'right nasal sidewall',
        dateModified: '2017-05-29',
        images: [
            {
                photo: moleImage,
                dateCreated: '2017-05-29',
            },
        ],
    },
    {
        category: 'arms',
        title: 'upper Forearm',
        dateModified: '2017-05-24',
        images: [
            {
                photo: moleImage,
                dateCreated: '2017-05-29',
            },
        ],
        clinicalDiagnosis: 'Clinical Diagnosis goes here',
        isClinicalDiagnosisBad: false,
    },
    {
        category: 'head',
        title: 'Rigth Ear Lobe',
        dateModified: '2017-05-24',
        images: [
            {
                photo: moleImage,
                dateCreated: '2017-05-24',
            },
            {
                photo: moleImage,
                dateCreated: '2017-05-24',
            },
            {
                photo: moleImage,
                dateCreated: '2017-05-24',
            },
        ],
        clinicalDiagnosis: 'Desmoplastic Melanoma',
        isClinicalDiagnosisBad: true,
    },
];

export const MolesList = React.createClass({
    propTypes: {
        navigator: React.PropTypes.object.isRequired, // eslint-disable-line
    },

    render() {
        const groupedMolesData = _.groupBy(molesData, (mole) => mole.category);

        return (
            <View>
                {_.map(groupedMolesData, (molesGroup, key) => (
                    <View key={key}>
                        <Title text={key} />
                        {_.map(molesGroup, (mole, index) => (
                            <Mole
                                key={`${key}-${index}`}
                                {...mole}
                                hasBorder={index !== 0}
                                navigator={this.props.navigator}
                                tree={this.props.tree}
                            />
                        ))}
                    </View>
                ))}
            </View>
        );
    },
});
