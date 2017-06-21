import React from 'react';
import {
    View,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import s from './styles';

export const Updater = React.createClass({
    propTypes: {
        service: React.PropTypes.func.isRequired,
        isLoading: React.PropTypes.bool,
        children: React.PropTypes.node.isRequired,
        style: React.PropTypes.number,
        color: React.PropTypes.string,
    },

    getInitialState() {
        return {
            canUpdate: true,
        };
    },

    async onScroll(e) {
        const { isLoading } = this.props;
        const { canUpdate } = this.state;
        const offset = e.nativeEvent.contentOffset.y;

        if (offset <= -70 && canUpdate && !isLoading) {
            this.setState({ canUpdate: false });
            await this.props.service();
        }
        if (offset > -70) {
            this.setState({ canUpdate: true });
        }
    },

    render() {
        const { isLoading, color } = this.props;

        return (
            <View style={[s.container, this.props.style]}>
                { isLoading ?
                    <View style={s.activityIndicator}>
                        <ActivityIndicator
                            animating
                            size="large"
                            color={color || '#FF1D70'}
                        />
                    </View>
                :
                    null
                }
                <ScrollView
                    onScroll={this.onScroll}
                    scrollEventThrottle={20}
                    automaticallyAdjustContentInsets={false}
                    contentContainerStyle={{ flex: 1, position: 'relative' }}
                    style={{ flex: 1 }}
                >
                    {this.props.children}
                </ScrollView>
            </View>
        );
    },
});
