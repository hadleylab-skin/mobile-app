import React from 'react';
import _ from 'lodash';
import BaobabPropTypes from 'baobab-prop-types';
import {
    View,
    Text,
    Image,
    ActivityIndicator,
} from 'react-native';
import schema from 'libs/state';
import { convertMoleToDisplay } from 'libs/misc';
import { InfoField } from 'components';
import { getAnatomicalSiteWidgetRoute } from 'screens/anatomical-site-widget';
import arrowImage from 'components/icons/arrow/arrow.png';
import dotImage from 'components/icons/dot/dot.png';
import frontImages from 'screens/anatomical-site-widget/components/front/large-images';
import backImages from 'screens/anatomical-site-widget/components/back/large-images';
import s from './styles';

const AnatomicalSite = schema({})(React.createClass({
    propTypes: {
        getPhotoSize: React.PropTypes.func.isRequired,
    },

    contextTypes: {
        mainNavigator: React.PropTypes.object.isRequired, // eslint-disable-line
        cursors: React.PropTypes.shape({
            currentPatientPk: BaobabPropTypes.cursor.isRequired,
            patientsMoles: BaobabPropTypes.cursor.isRequired,
        }),
        services: React.PropTypes.shape({
            updateMoleService: React.PropTypes.func.isRequired,
            getPatientMolesService: React.PropTypes.func.isRequired,
        }),
    },

    componentWillMount() {
        this.props.tree.on('update', this.props.getPhotoSize);
    },

    componentWillUnmount() {
        this.props.tree.off('update', this.props.getPhotoSize);
    },

    async onAddingComplete(skipPop) {
        const { cursors, services, mainNavigator } = this.context;
        const molePk = this.props.tree.get('data', 'pk');
        const patientPk = cursors.currentPatientPk.get();

        if (!skipPop) {
            mainNavigator.popN(2);
        }

        await services.getPatientMolesService(
            patientPk,
            cursors.patientsMoles.select(patientPk, 'moles')
        );

        await services.getMoleService(
            patientPk,
            molePk,
            this.props.tree,
        );
    },

    render() {
        const { cursors, mainNavigator } = this.context;
        const { anatomicalSite, patientAnatomicalSite, positionX, positionY } = this.props.tree.get('data');
        const imageName = _.camelCase(anatomicalSite.data.pk);
        let position = { positionX, positionY };
        const isLoading = this.props.tree.get('status') === 'Loading';
        let width = 0;
        let height = 0;

        if (!_.isEmpty(patientAnatomicalSite)) {
            width = patientAnatomicalSite.width;
            height = patientAnatomicalSite.height;
            position = convertMoleToDisplay(positionX, positionY, width, height);
        }

        return (
            <View style={s.container}>
                <View
                    style={[
                        s.preview,
                        _.isEmpty(patientAnatomicalSite) ? s.previewDefault : s.previewImage,
                    ]}
                >
                    <View style={s.activityIndicator}>
                        <ActivityIndicator
                            animating
                            size="large"
                            color="#FF1D70"
                        />
                    </View>
                    {!_.isEmpty(patientAnatomicalSite) ?
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
                    : (
                        <View style={s.defaultImageWrapper}>
                            <Image source={frontImages[imageName] || backImages[imageName]} />
                            <Image source={dotImage} style={[s.dot, { left: positionX, top: positionY }]} />
                        </View>
                    )}
                </View>
                <InfoField
                    title={'Site'}
                    controls={
                        <View style={s.site}>
                            <Text style={s.siteText}>{anatomicalSite.data.name}</Text>
                            <Image source={arrowImage} style={s.siteArrow} />
                        </View>
                    }
                    hasNoBorder
                    onPress={() => mainNavigator.push(
                        getAnatomicalSiteWidgetRoute({
                            tree: cursors.patientsMoles.select(
                                cursors.currentPatientPk.get(), 'anatomicalSites'
                            ),
                            onlyChangeAnatomicalSite: true,
                            currentAnatomicalSite: anatomicalSite.data.pk,
                            molePk: this.props.tree.get('data', 'pk'),
                            onAddingComplete: this.onAddingComplete,
                        }, this.context)
                    )}
                />
            </View>
        );
    },
}));

export default AnatomicalSite;
