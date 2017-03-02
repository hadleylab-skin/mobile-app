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

const model = (props) => (
    {
        tree: {
            currentSite: props.cursor.get(),
        },
    }
);

export const AnatomicalSiteWidget = schema(model)(React.createClass({
    displayName: 'AnatomicalSiteWidget',

    propTypes: {
        cursor: BaobabPropTypes.cursor.isRequired,
    },

    getInitialState() {
        return {
            wasFlipped: false,
        };
    },

    componentWillReceiveProps(nextProps) {
        if (nextProps.tree.currentSite !== this.props.tree.currentSite) {
            this.props.cursor.set(this.props.tree.currentSite.get());
        }
    },

    flipImage() {
        const wasFlipped = !this.state.wasFlipped;
        this.setState({ wasFlipped });
    },

    render() {
        const { currentSite } = this.props.tree;
        const { wasFlipped } = this.state;

        return (
            <ScrollView>
                <View style={s.container}>
                    <TouchableOpacity onPress={this.flipImage} style={s.flip}>
                        <Image source={flip} />
                    </TouchableOpacity>
                    <View style={s.widget}>
                        {wasFlipped ?
                            <HumanBackSide cursor={currentSite} />
                        :
                            <HumanFrontSide cursor={currentSite} />
                        }
                    </View>
                </View>
            </ScrollView>
        );
    },
}));
