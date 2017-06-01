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
        const label = _.startCase(key);
        const styles = stylesList[key];
        const source = image[1];
        const largeImageSource = largeImages[key];

        return {
            label,
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
        moles: [],
    },
};

export const AnatomicalSiteWidget = schema(model)(React.createClass({
    displayName: 'AnatomicalSiteWidget',

    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
    },

    getInitialState() {
        const value = this.props.tree.currentAnatomicalSite.get();

        return {
            wasFlipped: _.findIndex(backSites, { label: value }) !== -1,
        };
    },

    flipImage() {
        const wasFlipped = !this.state.wasFlipped;
        this.setState({ wasFlipped });
    },

    render() {
        const molesCursor = this.props.tree.moles;
        const { wasFlipped } = this.state;

        return (
            <ScrollView>
                <View style={s.container}>
                    <TouchableOpacity onPress={this.flipImage} style={s.flip}>
                        <Image source={flip} />
                    </TouchableOpacity>
                    <View style={s.widget}>
                        <View style={{ opacity: !wasFlipped ? 1 : 0, zIndex: !wasFlipped ? 1 : 0 }}>
                            <HumanBody
                                molesCursor={molesCursor}
                                bodyImage={front}
                                sites={frontSites}
                            />
                        </View>
                        <View style={{ opacity: wasFlipped ? 1 : 0, zIndex: wasFlipped ? 1 : 0 }}>
                            <HumanBody
                                molesCursor={molesCursor}
                                bodyImage={back}
                                sites={backSites}
                            />
                        </View>

                    </View>
                </View>
            </ScrollView>
        );
    },
}));
