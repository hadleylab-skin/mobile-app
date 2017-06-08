import React from 'react';
import _ from 'lodash';
import {
    View,
    ActivityIndicator,
} from 'react-native';
import schema from 'libs/state';
import { Title } from 'components/new/title';
import { Mole } from './mole';
import s from './styles';

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

const model = (props, context) => (
    {
        tree: {
            moles: (cursor) => context.services.getMolesService(props.pk, cursor),
        },
    }
);

export const MolesList = schema(model)(React.createClass({
    propTypes: {
        navigator: React.PropTypes.object.isRequired, // eslint-disable-line
    },

    contextTypes: {
        services: React.PropTypes.shape({
            getMolesService: React.PropTypes.func.isRequired,
        }),
    },

    render() {
        const status = this.props.tree.moles.status.get();
        const showLoader = status === 'Loading';
        const moles = this.props.tree.moles.get('data') || [];
        const groupedMolesData = !_.isEmpty(moles) ?
            _.groupBy(moles, (mole) => mole.anatomicalSites[0].pk)
            : [];

        return (
            <View style={s.container}>
                {showLoader ?
                    <View style={s.activityIndicator}>
                        <ActivityIndicator
                            animating={showLoader}
                            size="large"
                            color="#FF2D55"
                        />
                    </View>
                : null}
                {_.map(groupedMolesData, (molesGroup, key) => (
                    <View key={key}>
                        <Title text={key} />
                        {_.map(molesGroup, (mole, index) => {
                            const moleIndex = _.findIndex(moles, mole);

                            return (
                                <Mole
                                    key={`${key}-${index}`}
                                    hasBorder={index !== 0}
                                    navigator={this.props.navigator}
                                    tree={this.props.tree.moles.select('data', moleIndex)}
                                />
                            );
                        })}
                    </View>
                ))}
            </View>
        );
    },
}));
