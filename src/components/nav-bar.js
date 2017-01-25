import React from 'react';
import {
    Text,
    View,
    StyleSheet,
} from 'react-native';

export default React.createClass({
    displayName: 'NavBar',

    propTypes: {
        title: React.PropTypes.string.isRequired,
        leftBtnTitle: React.PropTypes.string,
        rightBtnTitle: React.PropTypes.string,
        onLeftBtnPress: React.PropTypes.func,
        onRightBtnPress: React.PropTypes.func,
    },

    render() {
        const { title, leftBtnTitle, rightBtnTitle, onLeftBtnPress, onRightBtnPress } = this.props;

        return (
            <View style={styles.headerWrapper}>
                <Text
                    style={[styles.btn, styles.btnLeft]}
                    onPress={onLeftBtnPress}
                >{leftBtnTitle}</Text>
                <Text style={styles.header}>{title}</Text>
                <Text
                    style={[styles.btn, styles.btnRight]}
                    onPress={onRightBtnPress}
                >{rightBtnTitle}</Text>
            </View>
        );
    },
});

const styles = StyleSheet.create({
    headerWrapper: {
        position: 'relative',
        borderBottomWidth: 0.5,
        borderBottomColor: '#ccc',
        paddingBottom: 15,
        zIndex: 1,
    },
    header: {
        color: '#FF3952',
        marginTop: 28,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: '500',
    },
    btn: {
        position: 'absolute',
        top: 32,
        color: '#FF3952',
        fontSize: 16,
        fontWeight: '400',
    },
    btnRight: {
        right: 15,
    },
    btnLeft: {
        left: 15,
    },
});
