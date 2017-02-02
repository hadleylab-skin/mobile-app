import React from 'react';
import _ from 'lodash';
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
import { getPatient } from 'libs/services/patients';
import ImageInfo from './image-info';

let styles = {};

const model = (props) => (
    {
        tree: {
            patient: getPatient(props.token, props.id),
        },
    }
);

const Patient = schema(model)(React.createClass({
    displayName: 'Patient',

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

    renderError(index) {
        return (
            <TouchableOpacity style={styles.photoWrapper} key={index}>
                <View style={styles.withoutImg}>
                    <Text style={styles.text}>
                        { `Upload error\n Click for details` }
                    </Text>
                </View>
            </TouchableOpacity>
        );
    },

    renderUploading(index) {
        return (
            <TouchableOpacity style={styles.photoWrapper} key={index}>
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
        const data = this.props.tree.patient.data.get();

        return (
            <View style={styles.container}>
                <StatusBar hidden={false} />
                <ScrollView>
                    <Text style={styles.name}>{ `${firstname} ${lastname}` }</Text>
                    <View style={{ alignItems: 'center' }}>
                        <Image
                            source={require('./images/default-user.png')}
                            style={styles.mainPhoto}
                        />
                    </View>
                    <Text style={styles.subtitle}>San Francisco C.A.</Text>
                    <View style={styles.photos}>
                        {_.map(data, (item, index) => {
                            const error = false;
                            const uploading = false;

                            if (error) {
                                return this.renderError(index);
                            }

                            if (uploading) {
                                return this.renderUploading(index);
                            }

                            if (!error && !uploading) {
                                return (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.photoWrapper}
                                        onPress={() => this.props.navigator.push({
                                            component: ImageInfo,
                                            title: `${firstname} ${lastname}`,
                                            onLeftButtonPress: () => this.props.navigator.pop(),
                                            navigationBarHidden: false,
                                            tintColor: '#FF2D55',
                                            passProps: {
                                                data: data[index],
                                            },
                                        })}
                                    >
                                        {this.renderActivityIndicator()}
                                        <Image
                                            source={{ uri: item.clinical_photo.thumbnail }}
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
});
