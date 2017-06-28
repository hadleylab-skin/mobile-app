import React from 'react';
import BaobabPropTypes from 'baobab-prop-types';
import _ from 'lodash';
import {
    View,
    TouchableOpacity,
    Image,
    ScrollView,
} from 'react-native';
import schema from 'libs/state';
import HumanBody from './components/human-body';
import s from './styles';
import frontStyles from './components/front/styles';
import backStyles from './components/back/styles';

import frontImages from './components/front';
import backImages from './components/back';
import frontLargeImages from './components/front/large-images';
import backLargeImages from './components/back/large-images';

import flip from './images/flip/flip.png';
import front from './images/front/front.png';
import back from './images/back/back.png';

function parseSites(images, largeImages, stylesList) {
    const sites = _.map(_.toPairs(images), (image) => {
        const key = image[0];
        const anatomicalSite = _.kebabCase(key);
        const styles = stylesList[key];
        const source = image[1];
        const largeImageSource = largeImages[key];

        return {
            anatomicalSite,
            styles,
            source,
            largeImageSource,
        };
    });

    return sites;
}

const frontSites = parseSites(frontImages, frontLargeImages, frontStyles);
const backSites = parseSites(backImages, backLargeImages, backStyles);

const model = (props, context) => {
    const patientPk = context.cursors.currentPatientPk.get();

    return {
        tree: (cursor) => context.services.getAnatomicalSitesService(patientPk, cursor),
    };
};

export const AnatomicalSiteWidget = schema(model)(React.createClass({
    displayName: 'AnatomicalSiteWidget',

    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        currentAnatomicalSite: React.PropTypes.string,
    },

    contextTypes: {
        cursors: React.PropTypes.shape({
            currentPatientPk: BaobabPropTypes.cursor.isRequired,
            patientsMoles: React.PropTypes.object.isRequired, // eslint-disable-line
        }),
        services: React.PropTypes.shape({
            getAnatomicalSitesService: React.PropTypes.func.isRequired,
        }),
    },

    getInitialState() {
        const value = this.props.currentAnatomicalSite;

        return {
            wasFlipped: _.findIndex(backSites, { anatomicalSite: value }) !== -1,
        };
    },

    async componentWillMount() {
        this.context.cursors.patientsMoles.on('update', this.onPatientsMolesUpdate);
    },

    componentWillUnmount() {
        this.context.cursors.patientsMoles.off('update', this.onPatientsMolesUpdate);
    },

    onPatientsMolesUpdate() {
        this.forceUpdate();
    },

    flipImage() {
        const wasFlipped = !this.state.wasFlipped;
        this.setState({ wasFlipped });
    },

    getAnatomicalSitesWithMoles() {
        const { cursors } = this.context;
        const patientPk = cursors.currentPatientPk.get();
        const patientMoles = cursors.patientsMoles.get(patientPk, 'moles', 'data');

        let anatomicalSitesWithMoles = [];

        _.map(patientMoles, (mole) => {
            const lastIndex = mole.data.anatomicalSites.length - 1;
            const anatomicalSite = mole.data.anatomicalSites[lastIndex].pk;

            if (_.findIndex(anatomicalSitesWithMoles, anatomicalSite) === -1) {
                anatomicalSitesWithMoles.push(anatomicalSite);
            }
        });

        return anatomicalSitesWithMoles;
    },

    render() {
        const { wasFlipped } = this.state;
        const anatomicalSitesWithMoles = this.getAnatomicalSitesWithMoles();

        return (
            <ScrollView>
                <View style={s.container}>
                    <TouchableOpacity onPress={this.flipImage} style={s.flip}>
                        <Image source={flip} />
                    </TouchableOpacity>
                    <View style={s.widget}>
                        <View style={{ opacity: !wasFlipped ? 1 : 0, zIndex: !wasFlipped ? 1 : 0 }}>
                            <HumanBody
                                bodyImage={front}
                                sites={frontSites}
                                anatomicalSitesWithMoles={anatomicalSitesWithMoles}
                                {...this.props}
                                tree={this.props.tree}
                            />
                        </View>
                        <View style={{ opacity: wasFlipped ? 1 : 0, zIndex: wasFlipped ? 1 : 0 }}>
                            <HumanBody
                                bodyImage={back}
                                sites={backSites}
                                anatomicalSitesWithMoles={anatomicalSitesWithMoles}
                                {...this.props}
                                tree={this.props.tree}
                            />
                        </View>
                    </View>
                </View>
            </ScrollView>
        );
    },
}));

export function getAnatomicalSiteWidgetRoute({ title, ...props }, context) {
    return {
        component: AnatomicalSiteWidget,
        title: title || 'Add photo',
        onLeftButtonPress: () => {
            if (props.onBackPress) {
                props.onBackPress();

                return;
            }

            context.mainNavigator.pop();
        },
        onRightButtonPress: () => {
            if (props.onBackPress) {
                props.onBackPress();

                return;
            }

            context.mainNavigator.pop();
        },
        navigationBarHidden: false,
        rightButtonTitle: 'Cancel',
        leftButtonIcon: require('components/icons/back/back.png'),
        tintColor: '#FF2D55',
        passProps: props,
    };
}
