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
        children: React.PropTypes.node.isRequired,
        style: React.PropTypes.number,
        color: React.PropTypes.string,
    },

    getInitialState() {
        return {
            isLoading: false,
            canUpdate: true,
        };
    },

    async onScroll(e) {
        const { canUpdate, isLoading } = this.state;
        const offset = e.nativeEvent.contentOffset.y;

        if (offset <= -70 && canUpdate && !isLoading) {
            this.setState({ canUpdate: false, isLoading: true });
            const result = await this.props.service();

            if (result.status === 'Succeed' || result.status === 'Failure') {
                this.setState({ isLoading: false });
            }
        }
        if (offset > -70) {
            this.setState({ canUpdate: true });
        }
    },

    render() {
        const { color } = this.props;
        const { isLoading } = this.state;

        return (
            <View style={[s.container, this.props.style]}>
                {isLoading ?
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
                    style={{ flex: 1 }}
                    contentContainerStyle={{ flex: 1, position: 'relative' }}
                >
                    {this.props.children}
                </ScrollView>
            </View>
        );
    },
});
