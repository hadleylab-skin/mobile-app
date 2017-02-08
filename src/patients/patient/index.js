import React from 'react';
import BaobabPropTypes from 'baobab-prop-types';
import {
    View,
    Text,
    StatusBar,
    Image,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import schema from 'libs/state';
import ImageInfo from './image-info';
import defaultUserImage from './images/default-user.png';
import s from './styles';

const model = (props) => (
    {
        tree: (cursor) => props.patientService(props.id, cursor),
    }
);

const Patient = schema(model)(React.createClass({
    displayName: 'Patient',

    propTypes: {
        navigator: React.PropTypes.object.isRequired, // eslint-disable-line
        tree: BaobabPropTypes.cursor.isRequired,
        id: React.PropTypes.number.isRequired,
        firstname: React.PropTypes.string.isRequired,
        lastname: React.PropTypes.string.isRequired,
        patientService: React.PropTypes.func.isRequired,
        imageService: React.PropTypes.func.isRequired,
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
        return this.props.patientService(id, tree);
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
        const { firstname, lastname } = this.props;
        const data = this.props.tree.data;
        const showLoader = this.props.tree.status.get() === 'Loading';

        return (
            <View style={s.container}>
                <StatusBar hidden={false} />
                { showLoader ?
                    <View style={s.activityIndicator}>
                        <ActivityIndicator
                            animating={showLoader}
                            size="large"
                            color="#FF2D55"
                        />
                    </View>
                :
                    null
                }
                <ScrollView
                    onScroll={this.onScroll}
                    scrollEventThrottle={200}
                >
                    <Text style={s.name}>{ `${firstname} ${lastname}` }</Text>
                    <View style={{ alignItems: 'center' }}>
                        <Image
                            source={defaultUserImage}
                            style={s.mainPhoto}
                        />
                    </View>
                    <Text style={s.subtitle}>San Francisco C.A.</Text>
                    <View style={s.photos}>
                        {data.get() && data.map((cursor) => {
                            const error = false;
                            const uploading = false;

                            if (error) {
                                return this.renderError();
                            }

                            if (uploading) {
                                return this.renderUploading();
                            }

                            if (!error && !uploading) {
                                return (
                                    <TouchableOpacity
                                        key={cursor.get('data', 'id')}
                                        style={s.photoWrapper}
                                        onPress={() => this.props.navigator.push({
                                            component: ImageInfo,
                                            title: `${firstname} ${lastname}`,
                                            onLeftButtonPress: () => this.props.navigator.pop(),
                                            navigationBarHidden: false,
                                            rightButtonTitle: 'Update',
                                            tintColor: '#FF2D55',
                                            passProps: {
                                                cursor,
                                                tree: this.props.tree,
                                                patientPk: this.props.id,
                                                imageService: this.props.imageService,
                                            },
                                        })}
                                    >
                                        {this.renderActivityIndicator()}
                                        <Image
                                            source={{ uri: cursor.get('data').clinical_photo.thumbnail }}
                                            style={s.photo}
                                        />
                                    </TouchableOpacity>
                                );
                            }

                            return null;
                        })}
                    </View>
                </ScrollView>
            </View>
        );
    },
}));

export default Patient;
