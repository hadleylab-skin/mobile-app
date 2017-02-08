import React from 'react';
import BaobabPropTypes from 'baobab-prop-types';
import {
    View,
    Text,
    StatusBar,
    StyleSheet,
    Image,
    Dimensions,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import schema from 'libs/state';
import ImageInfo from './image-info';
import defaultUserImage from './images/default-user.png';

let styles = {};

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
            <View style={styles.indicator}>
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
            <TouchableOpacity style={styles.photoWrapper}>
                <View style={styles.withoutImg}>
                    <Text style={styles.text}>
                        { 'Upload error\n Click for details' }
                    </Text>
                </View>
            </TouchableOpacity>
        );
    },

    renderUploading() {
        return (
            <TouchableOpacity style={styles.photoWrapper}>
                <View style={styles.withoutImg}>
                    <ActivityIndicator
                        animating
                        size="large"
                        color="#FF2D55"
                        style={{ marginBottom: 10 }}
                    />
                    <Text style={styles.text}>Uploading</Text>
                </View>
            </TouchableOpacity>
        );
    },

    render() {
        const { firstname, lastname } = this.props;
        const data = this.props.tree.data;
        const showLoader = this.props.tree.status.get() === 'Loading';

        return (
            <View style={styles.container}>
                <StatusBar hidden={false} />
                { showLoader ?
                    <View style={styles.activityIndicator}>
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
                    <Text style={styles.name}>{ `${firstname} ${lastname}` }</Text>
                    <View style={{ alignItems: 'center' }}>
                        <Image
                            source={defaultUserImage}
                            style={styles.mainPhoto}
                        />
                    </View>
                    <Text style={styles.subtitle}>San Francisco C.A.</Text>
                    <View style={styles.photos}>
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
                                        style={styles.photoWrapper}
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
                                            style={styles.photo}
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

const photosContainerWidth = Dimensions.get('window').width + 2;

styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 10,
        alignItems: 'center',
    },
    name: {
        fontSize: 24,
        lineHeight: 24,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    mainPhoto: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginTop: 15,
        marginBottom: 15,
    },
    subtitle: {
        fontSize: 18,
        lineHeight: 18,
        fontWeight: '300',
        textAlign: 'center',
    },
    photos: {
        flexDirection: 'row',
        width: photosContainerWidth,
        marginRight: -2,
        marginBottom: -3,
        marginTop: 15,
        flexWrap: 'wrap',
    },
    photoWrapper: {
        width: photosContainerWidth / 3,
        height: photosContainerWidth / 3,
    },
    withoutImg: {
        backgroundColor: '#fafafa',
        borderWidth: 0.5,
        borderColor: '#ccc',
        width: (photosContainerWidth / 3) - 2,
        height: (photosContainerWidth / 3) - 2,
        justifyContent: 'center',
    },
    photo: {
        width: (photosContainerWidth / 3) - 2,
        height: (photosContainerWidth / 3) - 2,
    },
    text: {
        textAlign: 'center',
        fontSize: 16,
        lineHeight: 16,
    },
    indicator: {
        position: 'absolute',
        left: 2,
        top: 2,
        right: 2,
        bottom: 2,
        justifyContent: 'center',
    },
    activityIndicator: {
        position: 'absolute',
        top: 85,
        left: 0,
        right: 0,
        justifyContent: 'center',
        zIndex: 1,
    },
});
