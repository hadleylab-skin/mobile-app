import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableWithoutFeedback,
} from 'react-native';
import schema from 'libs/state';
import { getRacesList } from 'libs/services/patients';
import { Input, Picker, DatePicker } from 'components';
import s from './styles';

const model = (props) => {
    const { data } = props;

    return {
        tree: {
            form: {
                firstname: data.firstname,
                lastname: data.lastname,
                medicalRecordNumber: '012345',
                date: new Date(),
                sex: 'Male',
                race: null,
            },
            offsetY: 0,
            racesList: getRacesList(),
            datePickerCursor: {},
            racePickerCursor: {},
        },
    };
};
const EditPatient = schema(model)(React.createClass({
    displayName: 'EditPatient',

    onScroll(e) {
        const offset = e.nativeEvent.contentOffset.y;
        this.props.tree.offsetY.set(offset);
    },

    renderSex() {
        const sexCursor = this.props.tree.form.sex;
        const sex = sexCursor.get();

        return (
            <TouchableWithoutFeedback
                onPress={() => sexCursor.set(sex && sex === 'Male' ? 'Female' : 'Male')}
            >
                <View style={s.wrapper}>
                    <Text style={[s.groupTitle, { paddingTop: 7, paddingBottom: 8 }]}>Sex:</Text>
                    <Text style={s.groupText}>{sex}</Text>
                </View>
            </TouchableWithoutFeedback>
        );
    },

    render() {
        const firstnameCursor = this.props.tree.form.firstname;
        const lastnameCursor = this.props.tree.form.lastname;
        const medicalRecordNumberCursor = this.props.tree.form.medicalRecordNumber;
        const raceCursor = this.props.tree.form.race;
        const dateCursor = this.props.tree.form.date;
        const racesList = this.props.tree.racesList.get();
        const offsetY = this.props.tree.offsetY.get();

        return (
            <View style={s.container}>
                <ScrollView
                    onScroll={this.onScroll}
                    scrollEventThrottle={200}
                    ref={(ref) => { this.scrollView = ref; }}
                >
                    <View style={{ marginBottom: 40 }}>
                        <View style={s.group}>
                            <View style={s.groupTitleWrapper}>
                                <Text style={s.groupTitle}>Patient name</Text>
                            </View>
                            <Input
                                label="First Name"
                                cursor={firstnameCursor}
                                inputWrapperStyle={s.wrapper}
                                inputStyle={s.input}
                                placeholderTextColor="#ccc"
                            />
                            <Input
                                label="Last Name"
                                cursor={lastnameCursor}
                                inputWrapperStyle={[s.wrapper, s.wrapperFull]}
                                inputStyle={s.input}
                                placeholderTextColor="#ccc"
                            />
                        </View>
                        <View style={s.group}>
                            <View style={s.groupTitleWrapper}>
                                <Text style={s.groupTitle}>Medical record number</Text>
                            </View>
                            <Input
                                label=""
                                cursor={medicalRecordNumberCursor}
                                inputWrapperStyle={[s.wrapper, s.wrapperFull]}
                                inputStyle={s.input}
                                placeholderTextColor="#ccc"
                            />
                        </View>
                        <View style={s.group}>
                            <View style={s.groupTitleWrapper}>
                                <Text style={s.groupTitle}>Patient Information</Text>
                            </View>
                            <DatePicker
                                tree={this.props.tree.datePickerCursor}
                                cursor={dateCursor}
                                title="Date of Birth"
                                onPress={() => { this.scrollView.scrollTo({ y: offsetY + 220, animated: true }); }}
                            />
                            {this.renderSex()}
                            <Picker
                                tree={this.props.tree.racePickerCursor}
                                cursor={raceCursor}
                                items={racesList}
                                title="Race"
                                onPress={() => { this.scrollView.scrollTo({ y: offsetY + 220, animated: true }); }}
                            />
                        </View>
                    </View>
                </ScrollView>
            </View>
        );
    },
}));

export default EditPatient;

export function getRoute(props, navigator) {
    const passProps = {
        tree: props.tree,
        data: props.data,
    };

    const { firstname, lastname } = props.data;

    return {
        component: EditPatient,
        leftButtonTitle: 'Cancel',
        onLeftButtonPress: () => navigator.pop(),
        title: `${firstname} ${lastname}`,
        rightButtonTitle: 'Update',
        navigationBarHidden: false,
        tintColor: '#FF2D55',
        passProps,
    };
}
