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

import flip from './images/flip/flip.png';
import front from './images/front/front.png';
import back from './images/back/back.png';

function parseSites(images, stylesList) {
    const sites = _.map(_.toPairs(images), (image) => {
        const key = image[0];
        const label = _.startCase(key);
        const styles = stylesList[key];
        const source = image[1];

        return {
            label,
            styles,
            source,
        };
    });

    return sites;
}

const frontSites = parseSites(frontImages, frontStyles);
const backSites = parseSites(backImages, backStyles);

export const AnatomicalSiteWidget = schema({})(React.createClass({
    displayName: 'AnatomicalSiteWidget',

    propTypes: {
        cursor: BaobabPropTypes.cursor.isRequired,
    },

    getInitialState() {
        const value = this.props.cursor.get();

        return {
            wasFlipped: _.findIndex(backSites, { label: value }) !== -1,
        };
    },

    flipImage() {
        const wasFlipped = !this.state.wasFlipped;
        this.setState({ wasFlipped });
    },

    render() {
        const currentSiteCursor = this.props.cursor;
        const { wasFlipped } = this.state;

        return (
            <ScrollView>
                <View style={s.container}>
                    <TouchableOpacity onPress={this.flipImage} style={s.flip}>
                        <Image source={flip} />
                    </TouchableOpacity>
                    <View style={s.widget}>
                        {wasFlipped ? (
                            <HumanBody
                                cursor={currentSiteCursor}
                                bodyImage={back}
                                sites={backSites}
                            />
                        ) : (
                            <HumanBody
                                cursor={currentSiteCursor}
                                bodyImage={front}
                                sites={frontSites}
                            />
                        )}
                    </View>
                </View>
            </ScrollView>
        );
    },
}));
