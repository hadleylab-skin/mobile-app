import React from 'react';
import {
    Dimensions,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Image,
} from 'react-native';
import Camera from 'react-native-camera';
import Footer from '../footer';

export default React.createClass({
    takePicture() {
        this.camera.capture()
        .then((data) => console.log(data))
        .catch((err) => console.error(err));
    },

    render() {
        return (
            <View style={styles.container}>
                <Camera
                    ref={(cam) => {
                        this.camera = cam;
                    }}
                    style={styles.preview}
                    aspect={Camera.constants.Aspect.fill}
                >
                    <View style={styles.textWrapper}>
                        <Text style={styles.name}>John Doe</Text>
                    </View>
                    <TouchableOpacity onPress={this.takePicture}>
                        <Image
                            source={require('./images/capture.png')}
                            style={styles.capture}
                        />
                    </TouchableOpacity>
                </Camera>
                <Footer navigator={this.props.navigator} />
            </View>
        );
    },
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingBottom: 50,
    },
    preview: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        height: Dimensions.get('window').height,
        width: Dimensions.get('window').width,
    },
    textWrapper: {
        position: 'absolute',
        top: 70,
        left: 0,
        right: 0,
    },
    name: {
        color: '#fff',
        fontSize: 30,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    capture: {
        flex: 0,
        padding: 10,
        margin: 40,
    },
});
