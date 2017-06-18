import React from 'react';
import _ from 'lodash';
import BaobabPropTypes from 'baobab-prop-types';
import {
    View,
    Text,
    Image,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import schema from 'libs/state';
import { roundToIntegers, convertMoleToDisplay } from 'libs/misc';
import { InfoField, AnatomicalSiteWidget } from 'components';
import arrowImage from 'components/icons/arrow/arrow.png';
import dotImage from 'components/icons/dot/dot.png';
import frontImages from 'components/anatomical-site-widget/components/front/large-images';
import backImages from 'components/anatomical-site-widget/components/back/large-images';
import s from './styles';

const AnatomicalSite = schema({})(React.createClass({
    contextTypes: {
        mainNavigator: React.PropTypes.object.isRequired, // eslint-disable-line
        currentPatientPk: BaobabPropTypes.cursor.isRequired,
        patientsMoles: BaobabPropTypes.cursor.isRequired,
        services: React.PropTypes.shape({
            updateMoleService: React.PropTypes.func.isRequired,
            getPatientMolesService: React.PropTypes.func.isRequired,
        }),
    },

    getInitialState() {
        return {
            photo: {
                width: 0,
                height: 0,
            },
        };
    },

    componentDidMount() {
        const { patientAnatomicalSite } = this.props.tree.get();

        if (!_.isEmpty(patientAnatomicalSite)) {
            const photo = patientAnatomicalSite.distantPhoto.fullSize;
            const windowWidth = Dimensions.get('window').width;

            Image.getSize(photo, (photoWidth, photoHeight) => {
                const width = windowWidth;
                const height = (width / photoWidth) * photoHeight;

                this.setState({ photo: { width, height: roundToIntegers(height) } });
            });
        }
    },

    async onAddingComplete(anatomicalSite) {
        const molePk = this.props.tree.get('pk');
        const patientPk = this.context.currentPatientPk.get();
        const service = this.context.services.updateMoleService;

        const data = { anatomicalSite };

        const result = await service(patientPk, molePk, this.props.tree.select('anatomicalSite'), data);

        if (result.status === 'Succeed') {
            this.context.mainNavigator.popN(2);

            await this.context.services.getPatientMolesService(
                patientPk,
                this.context.patientsMoles.select(patientPk, 'moles')
            );
        }
    },

    render() {
        const { width, height } = this.state.photo;
        const { anatomicalSite, patientAnatomicalSite, positionX, positionY } = this.props.tree.get();
        const imageName = _.camelCase(anatomicalSite.data.pk);
        let position = { positionX, positionY };

        if (!_.isEmpty(patientAnatomicalSite)) {
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
                            <Image
                                source={{ uri: patientAnatomicalSite.distantPhoto.fullSize }}
                                resizeMode="contain"
                                style={{ width, height }}
                            />
                            {width && height ?
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
                    onPress={() => {
                        this.context.mainNavigator.push({
                            component: AnatomicalSiteWidget,
                            title: 'Add photo',
                            onLeftButtonPress: () => this.context.mainNavigator.pop(),
                            onRightButtonPress: () => {
                                this.context.mainNavigator.pop();
                            },
                            navigationBarHidden: false,
                            rightButtonTitle: 'Cancel',
                            leftButtonIcon: require('components/icons/back/back.png'),
                            tintColor: '#FF1D70',
                            passProps: {
                                tree: this.context.patientsMoles.select(this.context.currentPatientPk.get()),
                                onlyChangeAnatomicalSite: true,
                                currentAnatomicalSite: anatomicalSite.data.pk,
                                onAddingComplete: (site) => this.onAddingComplete(site),
                            },
                        });
                    }}
                />
            </View>
        );
    },
}));

export default AnatomicalSite;
