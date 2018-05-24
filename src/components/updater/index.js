import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';

import {
    View,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import s from './styles';

export const onScroll = (service) => async function (e) {
    const { canUpdate, isLoading } = this.state;
    const offset = e.nativeEvent.contentOffset.y;

    if (offset <= -70 && canUpdate && !isLoading) {
        this.setState({ canUpdate: false, isLoading: true });
        const result = await service();

        if (result.status === 'Succeed' || result.status === 'Failure') {
            setTimeout(() => this.setState({ isLoading: false }), 1000);
        }
    }
    if (offset > -1) {
        this.setState({ canUpdate: true });
    }
};

export const Updater = createReactClass({
    propTypes: {
        service: PropTypes.func.isRequired,
        children: PropTypes.node.isRequired,
        style: PropTypes.number,
        color: PropTypes.string,
        onScrollView: PropTypes.func,
    },

    getInitialState() {
        return {
            isLoading: false,
            canUpdate: true,
        };
    },

    scrollTo(params) {
        if (this.scrollView) {
            this.scrollView.scrollTo(params);
        }
    },

    render() {
        const { color } = this.props;
        const { isLoading } = this.state;
        const _onScroll = onScroll(this.props.service);

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
                    onScroll={(e) => {
                        _onScroll.bind(this)(e);
                        if (this.props.onScrollView) {
                            this.props.onScrollView(e);
                        }
                    }}
                    scrollEventThrottle={20}
                    automaticallyAdjustContentInsets={false}
                    style={{ flex: 1 }}
                    contentContainerStyle={{ flex: 1, position: 'relative' }}
                    ref={(ref) => { this.scrollView = ref; }}
                >
                    {this.props.children}
                </ScrollView>
            </View>
        );
    },
});
