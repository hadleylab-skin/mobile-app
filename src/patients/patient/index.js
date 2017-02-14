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
import ImageInfo, { submit } from './image-info';
import defaultUserImage from './images/default-user.png';
import s from './styles';

const model = (props) => (
    {
        tree: (cursor) => props.patientImagesService(props.id, cursor),
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
        patientImagesService: React.PropTypes.func.isRequired,
        getImageService: React.PropTypes.func.isRequired,
        updateImageService: React.PropTypes.func.isRequired,
        anatomicalSiteList: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
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
        return this.props.patientImagesService(id, tree);
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
        const { firstname, lastname, id } = this.props;
        const data = this.props.tree.data;
        const showLoader = this.props.tree.status.get() === 'Loading';

        return (
            <View style={s.container}>
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

                            let form;

                            if (!error && !uploading) {
                                const patientPk = id;
                                const imagePk = cursor.get('data', 'id');
                                const updateImageService = this.props.updateImageService;
                                const navigator = this.props.navigator;
                                const tree = this.props.tree;

                                const passProps = {
                                    register: (ref) => { form = ref; },
                                    cursor,
                                    patientPk,
                                    tree,
                                    getImageService: this.props.getImageService,
                                    anatomicalSiteList: this.props.anatomicalSiteList,
                                };

                                return (
                                    <TouchableOpacity
                                        key={imagePk}
                                        style={s.photoWrapper}
                                        onPress={() => navigator.push({
                                            component: ImageInfo,
                                            title: `${firstname} ${lastname}`,
                                            onLeftButtonPress: () => navigator.pop(),
                                            navigationBarHidden: false,
                                            rightButtonTitle: 'Update',
                                            onRightButtonPress: async () =>
                                                submit(patientPk, imagePk, cursor,
                                                    updateImageService, navigator, form, tree),
                                            tintColor: '#FF2D55',
                                            passProps,
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
