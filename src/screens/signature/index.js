import React from 'react';
import _ from 'lodash';
import {
    View,
    Text,
    TouchableHighlight,
    StyleSheet,
} from 'react-native';
import SignatureCapture from 'react-native-signature-capture';

const styles = StyleSheet.create({
    signature: {
        flex: 1,
        borderColor: '#000033',
        borderWidth: 1,
    },
    buttonStyle: {
        flex: 1, justifyContent: "center", alignItems: "center", height: 50,
        backgroundColor: "#eeeeee",
        margin: 10
    }
});


const Signature = React.createClass({
    onSave() {
        const image = this.signature.saveImage();
        console.log(image);
    },
    render() {
        return (
            <View style={{ flex: 1, flexDirection: "column" }}>
                <Text style={{alignItems:"center",justifyContent:"center"}}>Signature Capture Extended </Text>
                <SignatureCapture
                    ref={(signature) => { this.signature = signature; }}
                    onSaveEvent={this.props.onSave}
                    style={[{flex:1},styles.signature]}
                    saveImageFileInExtStorage={false}
                    showNativeButtons={false}
                    showTitleLabel={false}
                    viewMode={"portrait"}/>

                <View style={{ flex: 1, flexDirection: "row" }}>
                    <TouchableHighlight style={styles.buttonStyle}
                        onPress={() => { this.onSave() } } >
                        <Text>Save</Text>
                    </TouchableHighlight>

                    <TouchableHighlight style={styles.buttonStyle}
                        onPress={() => this.props.navigator.pop()} >
                        <Text>Reset</Text>
                    </TouchableHighlight>

                </View>

            </View>
        );
    },
});

export function getSignatureRoute(props){
    return {
        component: Signature,
        passProps: props,
    };
}
