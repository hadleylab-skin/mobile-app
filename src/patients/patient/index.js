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
} from 'react-native';

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

const styles = StyleSheet.create({
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
    photo: {
        width: (photosContainerWidth / 3) - 2,
        height: (photosContainerWidth / 3) - 2,
    },
});
