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
/*
   REVIEW
   It should be
   import frontImages from './components/front';

   You need to fix export
   export default {} inside ./component/front
*/

import flip from './images/flip/flip.png';
import front from './images/front/front.png';
import back from './images/back/back.png';

/*
   REVIEW
   const images = parseSites(frontImages);
*/

export const AnatomicalSiteWidget = schema({})(React.createClass({
    displayName: 'AnatomicalSiteWidget',

    propTypes: {
        cursor: BaobabPropTypes.cursor.isRequired,
    },

    getInitialState() {
        return {
            wasFlipped: false, //REVIEW: _.include(this.props.cursor.get(), frontImages);
        };
    },

    flipImage() {
        const wasFlipped = !this.state.wasFlipped;
        this.setState({ wasFlipped });
    },

    parseSites(images, stylesList) {
        /*
        REVIEW
           This function will be called for any render.
           This values should be calculated once.
        */
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

        return (
            <ScrollView>
                <View style={s.container}>
                    <TouchableOpacity onPress={this.flipImage} style={s.flip}>
                        <Image source={flip} />
                    </TouchableOpacity>
                    <View style={s.widget}>
                        {/*
                            REVIEW
                            { wasFlipped ? <HumanBody front/> : <HumanBody back/> }
                          */}
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
