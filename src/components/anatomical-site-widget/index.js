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

import * as frontImages from './components/front';
import * as backImages from './components/back';

import flip from './images/flip/flip.png';
import front from './images/front/front.png';
import back from './images/back/back.png';

export const AnatomicalSiteWidget = schema({})(React.createClass({
    displayName: 'AnatomicalSiteWidget',

    propTypes: {
        cursor: BaobabPropTypes.cursor.isRequired,
    },

    getInitialState() {
        return {
            wasFlipped: false,
        };
    },

    flipImage() {
        const wasFlipped = !this.state.wasFlipped;
        this.setState({ wasFlipped });
    },

    parseSites(images, stylesList) {
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
    },

    render() {
        const currentSiteCursor = this.props.cursor;
        const { wasFlipped } = this.state;

        console.log(this.parseSites(backImages, backStyles));

        return (
            <ScrollView>
                <View style={s.container}>
                    <TouchableOpacity onPress={this.flipImage} style={s.flip}>
                        <Image source={flip} />
                    </TouchableOpacity>
                    <View style={s.widget}>
                        <HumanBody
                            cursor={currentSiteCursor}
                            bodyImage={front}
                            sites={this.parseSites(frontImages, frontStyles)}
                            isShown={!wasFlipped}
                        />
                        <HumanBody
                            cursor={currentSiteCursor}
                            bodyImage={back}
                            sites={this.parseSites(backImages, backStyles)}
                            isShown={wasFlipped}
                        />
                    </View>
                </View>
            </ScrollView>
        );
    },
}));
