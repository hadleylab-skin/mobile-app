import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    ScrollView,
    Dimensions,
    TouchableHighlight,
} from 'react-native';

const styles = StyleSheet.create({
    container: {
        borderBottomWidth: 0.5,
        borderBottomColor: '#eee',
        flex: 1,
    },
    select: {
        width: 100,
        flex: 0,
        backgroundColor: 'rgba(255,45,85, 0.8)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectText: {
        color: '#fff',
        fontSize: 22,
        fontWeight: '500',
    },
    inner: {
        flex: 1,
        width: Dimensions.get('window').width,
        padding: 15,
        alignItems: 'stretch',
        flexWrap: 'nowrap',
        flexDirection: 'row',
    },
    img: {
        width: 70,
        height: 70,
        borderRadius: 35,
    },
    info: {
        flex: 1,
        paddingLeft: 15,
    },
    text: {
        color: '#333',
        marginBottom: 5,
        fontSize: 14,
    },
});

export default React.createClass({
    displayName: 'PatientListItem',

    propTypes: {
        data: React.PropTypes.shape({
            id: React.PropTypes.int,
            firstname: React.PropTypes.string,
            lastname: React.PropTypes.string,
            total_images: React.PropTypes.number,
            profile_pic: React.PropTypes.shape({
                thumbnail: React.PropTypes.string,
            }),
        }).isRequired,
        changeCurrentPatient: React.PropTypes.func.isRequired,
        activatePatient: React.PropTypes.func.isRequired,
        isPatientActiveInListView: React.PropTypes.bool.isRequired,
    },

    onScroll(e) {
        const offset = e.nativeEvent.contentOffset.x;
        if (offset < 0 && !this.props.isPatientActiveInListView) {
            this.props.activatePatient(this.props.data.id);
        }
    },

    render() {
        const { firstname, lastname, total_images, profile_pic } = this.props.data;
        const { isPatientActiveInListView } = this.props;

        return (
            <View style={styles.container}>
                <ScrollView
                    showsHorizontalScrollIndicator={false}
                    scrollEventThrottle={16}
                    style={{ flex: 1 }}
                    contentOffset={isPatientActiveInListView ? {} : { x: 100 }}
                    onScroll={this.onScroll}
                    horizontal
                >
                    <TouchableHighlight
                        style={styles.select}
                        underlayColor="#FF2D55"
                        onPress={() => {
                            this.setState({ activePatientId: 0 });
                            this.props.changeCurrentPatient(this.props.data);
                        }}
                    >
                        <Text style={styles.selectText}>Select</Text>
                    </TouchableHighlight>
                    <View style={styles.inner}>
                        <Image
                            source={{ uri: profile_pic.thumbnail }}
                            style={styles.img}
                        />
                        <View style={styles.info}>
                            <Text style={[styles.text, { fontSize: 18 }]}>
                                {`${firstname} ${lastname} ${isPatientActiveInListView}`}
                            </Text>
                            <Text style={[styles.text, { opacity: 0.6 }]}>
                                Images: {total_images}
                            </Text>
                            <Text style={[styles.text, { opacity: 0.8 }]}>
                                Last Upload: 2 months ago
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </View>
        );
    },
});
