import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableWithoutFeedback,
    Alert,
} from 'react-native';
import schema from 'libs/state';
import { Form, Input, Picker, DatePicker } from 'components';
import s from './styles';

const model = (props) => {
    const { firstname, lastname, mrn, sex, dob, race } = props.currentPatientCursor.data.get();

    return {
        tree: {
            form: {
                firstname,
                lastname,
                mrn,
                dob,
                sex,
                race,
            },
            offsetY: 0,
            datePickerCursor: {},
            racePickerCursor: {},
        },
    };
};

const EditPatient = schema(model)(React.createClass({
    displayName: 'EditPatient',

    propTypes: {
        racesList: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
    },

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
        const mrnCursor = this.props.tree.form.mrn;
        const raceCursor = this.props.tree.form.race;
        const dobCursor = this.props.tree.form.dob;
        const offsetY = this.props.tree.offsetY.get();

        return (
            <View style={s.container}>
                <ScrollView
                    onScroll={this.onScroll}
                    scrollEventThrottle={200}
                    ref={(ref) => { this.scrollView = ref; }}
                >
                    <View style={{ marginBottom: 40 }}>
                        <Form onSubmit={() => console.log('submit')}>
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
                                    returnKeyType="next"
                                />
                                <Input
                                    label="Last Name"
                                    cursor={lastnameCursor}
                                    inputWrapperStyle={[s.wrapper, s.wrapperFull]}
                                    inputStyle={s.input}
                                    placeholderTextColor="#ccc"
                                    returnKeyType="next"
                                />
                            </View>
                            <View style={s.group}>
                                <View style={s.groupTitleWrapper}>
                                    <Text style={s.groupTitle}>Medical record number</Text>
                                </View>
                                <Input
                                    label=""
                                    cursor={mrnCursor}
                                    inputWrapperStyle={[s.wrapper, s.wrapperFull]}
                                    inputStyle={s.input}
                                    placeholderTextColor="#ccc"
                                />
                                {/* REVIEW Input shoudl have returnKeyType="next" */}
                            </View>
                        </Form>
                        {/* REVIEW Form should wrap all items, not only text inputs  */}
                        <View style={s.group}>
                            <View style={s.groupTitleWrapper}>
                                <Text style={s.groupTitle}>Patient Information</Text>
                            </View>
                            <DatePicker
                                tree={this.props.tree.datePickerCursor}
                                cursor={dobCursor}
                                title="Date of Birth"
                                onPress={() => { this.scrollView.scrollTo({ y: offsetY + 220, animated: true }); }}
                            />
                            {/* REVIEW DatePicker should be compatible with Form component */
                             /*        The focus method should be implemented */ }
                            {this.renderSex()}
                            <Picker
                                tree={this.props.tree.racePickerCursor}
                                cursor={raceCursor}
                                items={this.props.racesList}
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

async function submit(props, navigator) {
    const patientPk = props.currentPatientCursor.get('id');
    // REVIEW there is a bug in the prev line, fix it
    const cursor = props.currentPatientCursor;
    const formData = props.tree.form.get();

    const result = await props.updatePatientService(patientPk, cursor, formData);

    if (result.status === 'Failure') {
        Alert.alert(
            'Update Patient Error',
            JSON.stringify(result));
    } else {
        navigator.pop();
    }
}

export function getRoute(props, navigator) {
    const passProps = {
        tree: props.tree,
        currentPatientCursor: props.currentPatientCursor,
        updatePatientService: props.updatePatientService,
        racesList: props.racesList,
    };

    const { firstname, lastname } = props.currentPatientCursor.data.get();

    return {
        component: EditPatient,
        leftButtonTitle: 'Cancel',
        onLeftButtonPress: () => navigator.pop(),
        title: `${firstname} ${lastname}`,
        rightButtonTitle: 'Update',
        onRightButtonPress: () => submit(passProps, navigator),
        navigationBarHidden: false,
        tintColor: '#FF2D55',
        passProps,
    };
}
