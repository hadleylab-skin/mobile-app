import React from 'react';
import BaobabPropTypes from 'baobab-prop-types';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import schema from 'libs/state';
import { getRoute } from './image-info';
import { GeneralInfo } from './components/general-info';
import { MolesInfo } from './components/moles-info';
import { MolesList } from './components/moles-list';
import s from './styles';

const model = (props, context) => (
    {
        tree: (cursor) => context.services.patientImagesService(props.id, cursor),
    }
);

const Patient = schema(model)(React.createClass({
    displayName: 'Patient',

    propTypes: {
        navigator: React.PropTypes.object.isRequired, // eslint-disable-line
        tree: BaobabPropTypes.cursor.isRequired,
        id: React.PropTypes.number.isRequired,
        anatomicalSiteList: React.PropTypes.arrayOf( //eslint-disable-line
            React.PropTypes.arrayOf(React.PropTypes.string)).isRequired,
        patientCursor: BaobabPropTypes.cursor.isRequired,
    },

    contextTypes: {
        services: React.PropTypes.shape({
            patientImagesService: React.PropTypes.func.isRequired,
            updateImageService: React.PropTypes.func.isRequired,
        }),
    },

    getInitialState() {
        return {
            canUpdate: true,
        };
    },

    async onScroll(e) {
        const offset = e.nativeEvent.contentOffset.y;
        if (offset < -130 && this.state.canUpdate && this.props.tree.status.get() !== 'Loading') {
            this.setState({ canUpdate: false });
            await this.updatePatient();
        }
        if (offset > -70) {
            this.setState({ canUpdate: true });
        }
    },

    updatePatient() {
        const { id, tree } = this.props;
        return this.context.services.patientImagesService(id, tree);
    },

    renderActivityIndicator() {
        return (
            <View style={s.indicator}>
                <ActivityIndicator
                    animating
                    size="large"
                    color="#FF2D55"
                />
            </View>
        );
    },

    renderError() {
        return (
            <TouchableOpacity style={s.photoWrapper}>
                <View style={s.withoutImg}>
                    <Text style={s.text}>
                        { 'Upload error\n Click for details' }
                    </Text>
                </View>
            </TouchableOpacity>
        );
    },

    renderUploading() {
        return (
            <TouchableOpacity style={s.photoWrapper}>
                <View style={s.withoutImg}>
                    <ActivityIndicator
                        animating
                        size="large"
                        color="#FF2D55"
                        style={{ marginBottom: 10 }}
                    />
                    <Text style={s.text}>Uploading</Text>
                </View>
            </TouchableOpacity>
        );
    },

    render() {
        const data = this.props.tree.data;

        return (
            <View style={s.container}>
                <ScrollView
                    onScroll={this.onScroll}
                    scrollEventThrottle={200}
                >
                    <GeneralInfo
                        {...this.props.patientCursor.get('data')}
                        consentCursor={this.props.patientCursor.select('consentDateExpired')}
                    />
                    <MolesInfo />
                    <MolesList />
                </ScrollView>
            </View>
        );
    },
}));

export default Patient;
