import React from 'react';
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

let styles = {};

export default React.createClass({
    displayName: 'Patient',

    render() {
        return (
            <View style={styles.container}>
                <StatusBar hidden={false} />
                <ScrollView>
                    <Text style={styles.name}>Suzanne Reed</Text>
                    <View style={{ alignItems: 'center' }}>
                        <Image
                            source={require('./images/default-user.png')}
                            style={styles.mainPhoto}
                        />
                    </View>
                    <Text style={styles.subtitle}>San Francisco C.A.</Text>
                    <View style={styles.photos}>
                        <TouchableOpacity style={styles.photoWrapper}>
                            <Image
                                source={require('./images/shore.jpg')}
                                style={styles.photo}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.photoWrapper}>
                            <View style={styles.withoutImg}>
                                <Text style={styles.text}>{ `Upload error\n Click for details` }</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.photoWrapper}>
                            <Image
                                source={require('./images/shore.jpg')}
                                style={styles.photo}
                            />
                        </TouchableOpacity>
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
                        <TouchableOpacity style={styles.photoWrapper}>
                            <Image
                                source={require('./images/shore.jpg')}
                                style={styles.photo}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.photoWrapper}>
                            <Image
                                source={require('./images/shore.jpg')}
                                style={styles.photo}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.photoWrapper}>
                            <Image
                                source={require('./images/shore.jpg')}
                                style={styles.photo}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.photoWrapper}>
                            <Image
                                source={require('./images/shore.jpg')}
                                style={styles.photo}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.photoWrapper}>
                            <Image
                                source={require('./images/shore.jpg')}
                                style={styles.photo}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.photoWrapper}>
                            <Image
                                source={require('./images/shore.jpg')}
                                style={styles.photo}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.photoWrapper}>
                            <Image
                                source={require('./images/shore.jpg')}
                                style={styles.photo}
                            />
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        );
    },
});

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
});
