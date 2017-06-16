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

const model = {
    tree: {
        anatomicalSites: {},
    },
};

export const AnatomicalSiteWidget = schema(model)(React.createClass({
    displayName: 'AnatomicalSiteWidget',

    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        onAddingComplete: React.PropTypes.func.isRequired,
        onlyChangeAnatomicalSite: React.PropTypes.bool,
        currentAnatomicalSite: React.PropTypes.string,
    },

    contextTypes: {
        currentPatientPk: BaobabPropTypes.cursor.isRequired,
        patientsMoles: React.PropTypes.object.isRequired, // eslint-disable-line
        services: React.PropTypes.shape({
            getAnatomicalSitesService: React.PropTypes.func.isRequired,
        }),
    },

    getInitialState() {
        const value = this.props.tree.currentAnatomicalSite.get();

        return {
            wasFlipped: _.findIndex(backSites, { label: value }) !== -1,
        };
    },

    async componentWillMount() {
        const patientPk = this.context.currentPatientPk.get();

        await this.context.services.getAnatomicalSitesService(
            patientPk,
            this.props.tree.anatomicalSites
        );

        this.context.patientsMoles.on('update', this.onPatientsMolesUpdate);
    },

    componentWillUnmount() {
        this.context.patientsMoles.off('update', this.onPatientsMolesUpdate);
    },

    onPatientsMolesUpdate() {
        this.forceUpdate();
    },

    flipImage() {
        const wasFlipped = !this.state.wasFlipped;
        this.setState({ wasFlipped });
    },

    getAnatomicalSitesWithMoles() {
        const patientPk = this.context.currentPatientPk.get();
        const patientMoles = this.context.patientsMoles.get(patientPk, 'moles', 'data');

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
                                tree={this.props.tree.select('anatomicalSites')}
                                bodyImage={front}
                                sites={frontSites}
                                onAddingComplete={this.props.onAddingComplete}
                                anatomicalSitesWithMoles={anatomicalSitesWithMoles}
                                onlyChangeAnatomicalSite={this.props.onlyChangeAnatomicalSite}
                                currentAnatomicalSite={this.props.currentAnatomicalSite}
                            />
                        </View>
                        <View style={{ opacity: wasFlipped ? 1 : 0, zIndex: wasFlipped ? 1 : 0 }}>
                            <HumanBody
                                tree={this.props.tree.select('anatomicalSites')}
                                bodyImage={back}
                                sites={backSites}
                                onAddingComplete={this.props.onAddingComplete}
                                anatomicalSitesWithMoles={anatomicalSitesWithMoles}
                                onlyChangeAnatomicalSite={this.props.onlyChangeAnatomicalSite}
                                currentAnatomicalSite={this.props.currentAnatomicalSite}
                            />
                        </View>
                    </View>
                </View>
            </ScrollView>
        );
    },
}));
