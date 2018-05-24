import React from 'react';
import _ from 'lodash';
import BaobabPropTypes from 'baobab-prop-types';
import createReactClass from 'create-react-class';
import {
    View,
    Text,
    Image,
    ActivityIndicator,
} from 'react-native';
import schema from 'libs/state';
import { convertMoleToDisplay } from 'libs/misc';
import { InfoField } from 'components';
import dotImage from 'components/icons/dot/dot.png';
import s from './styles';

const AnatomicalSite = schema({})(createReactClass({
    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
    },

    render() {
        const { anatomicalSite, patientAnatomicalSite, positionInfo } = this.props.tree.get('data');
        const { positionX, positionY } = positionInfo;
        let position = { positionX, positionY };
        const isLoading = this.props.tree.get('status') === 'Loading';
        const hasAnatomicalSite = !_.isEmpty(patientAnatomicalSite);
        let width = 0;
        let height = 0;


        if (hasAnatomicalSite) {
            width = patientAnatomicalSite.width;
            height = patientAnatomicalSite.height;
            position = convertMoleToDisplay(positionX, positionY, width, height);
        }

        return (
            <View style={s.container}>
                <View style={hasAnatomicalSite ? s.preview : {}}>
                    {hasAnatomicalSite ?
                        <View style={{ flex: 1, position: 'relative' }}>
                            <View style={s.activityIndicator}>
                                <ActivityIndicator
                                    animating
                                    size="large"
                                    color="#FF1D70"
                                />
                            </View>
                            <View style={{ marginTop: -(positionY - 70) }}>
                                {!isLoading ?
                                    <Image
                                        source={{ uri: patientAnatomicalSite.distantPhoto.fullSize }}
                                        resizeMode="contain"
                                        style={{ width, height }}
                                    />
                                : null}
                                {width && height && !isLoading ?
                                    <Image
                                        source={dotImage}
                                        style={[s.dot, { left: position.positionX, top: position.positionY }]}
                                    />
                                : null}
                            </View>
                        </View>
                    : null}
                </View>
                <InfoField
                    title={'Site'}
                    controls={
                        <View style={s.site}>
                            <Text style={s.siteText}>{anatomicalSite.data.name}</Text>
                        </View>
                    }
                    hasNoBorder={hasAnatomicalSite}
                />
            </View>
        );
    },
}));

export default AnatomicalSite;
