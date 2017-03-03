import React from 'react';
import BaobabPropTypes from 'baobab-prop-types';
import {
    View,
    TouchableOpacity,
    Image,
    ScrollView,
} from 'react-native';
import schema from 'libs/state';
import HumanFrontSide from './components/front';
import HumanBackSide from './components/back';
import s from './styles';

import flip from './images/flip/flip.png';

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
                        <HumanFrontSide cursor={currentSiteCursor} isShown={!wasFlipped} />
                        <HumanBackSide cursor={currentSiteCursor} isShown={wasFlipped} />
                    </View>
                </View>
            </ScrollView>
        );
    },
}));
