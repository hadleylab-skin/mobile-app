import React from 'react';
import {
    View,
    Text,
    Image,
    ScrollView,
} from 'react-native';
import schema from 'libs/state';
import { InfoField, Switch, Picker, AnatomicalSiteWidget } from 'components';
import arrowImage from 'components/icons/arrow/arrow.png';
import Gallery from './components/gallery';
import Prediction from './components/prediction';
import s from './styles';

const model = {
    tree: {
        biopsy: false,
        clinicalDiagnosis: '',
        pathDiagnosis: '',
        lesionsSize: '',

        clinicalDiagnosisPickerCursor: {},
        pathDiagnosisPickerCursor: {},
        lesionsSizePickerCursor: {},
    },
};

const diagnosesList = [
    ['Diagnosis 1', 'Diagnosis 1'],
    ['Diagnosis 2', 'Diagnosis 2'],
    ['Diagnosis 3', 'Diagnosis 3'],
    ['Diagnosis 4', 'Diagnosis 4'],
    ['Diagnosis 5', 'Diagnosis 5'],
    ['Diagnosis 6', 'Diagnosis 6'],
    ['Diagnosis 7', 'Diagnosis 7'],
];

const lesionsSizeCM = [
    ['1 by 2 cm', '1 by 2 cm'],
    ['2 by 3 cm', '2 by 3 cm'],
    ['3 by 4 cm', '3 by 4 cm'],
    ['4 by 5 cm', '4 by 5 cm'],
    ['5 by 6 cm', '5 by 6 cm'],
    ['6 by 7 cm', '6 by 7 cm'],
    ['7 by 8 cm', '7 by 8 cm'],
];

const lesionsSizeIN = [
    ['1 by 2 in', '1″ by 2″'],
    ['2 by 3 in', '2″ by 3″'],
    ['3 by 4 in', '3″ by 4″'],
    ['4 by 5 in', '4″ by 5″'],
    ['5 by 6 in', '5″ by 6″'],
    ['6 by 7 in', '6″ by 7″'],
    ['7 by 8 in', '7″ by 8″'],
];

const Mole = schema(model)(React.createClass({
    displayName: 'Mole',

    propTypes: {},

    contextTypes: {
        mainNavigator: React.PropTypes.object.isRequired, // eslint-disable-line
    },

    renderFields() {
        const biopsyCursor = this.props.tree.biopsy;
        const clinicalDiagnosisCursor = this.props.tree.clinicalDiagnosis;
        const pathDiagnosisCursor = this.props.tree.pathDiagnosis;
        const lesionsSizeCursor = this.props.tree.lesionsSize;

        const units = 'in'; /* in || cm */

        return (
            <View style={s.fields}>
                <InfoField
                    title={'Site'}
                    controls={
                        <View style={s.site}>
                            <Text style={s.siteText}>Left Ear Helix</Text>
                            <Image source={arrowImage} style={s.siteArrow} />
                        </View>
                    }
                    hasNoBorder
                    onPress={() => {
                        this.context.mainNavigator.push({
                            component: AnatomicalSiteWidget,
                            title: 'Add photo',
                            onLeftButtonPress: () => this.context.mainNavigator.pop(),
                            onRightButtonPress: () => {
                                this.context.mainNavigator.pop();
                            },
                            navigationBarHidden: false,
                            rightButtonTitle: 'Cancel',
                            leftButtonIcon: require('components/icons/back/back.png'),
                            tintColor: '#FF2D55',
                            passProps: {
                                tree: this.props.tree,
                                onAddingComplete: () => this.context.mainNavigator.pop(),
                            },
                        });
                    }}
                />
                <Picker
                    tree={this.props.tree.clinicalDiagnosisPickerCursor}
                    cursor={clinicalDiagnosisCursor}
                    items={diagnosesList}
                    title="Clinical Diagnosis"
                    onPress={() => console.log('Clinical Diagnosis pressed')}
                />
                <Picker
                    tree={this.props.tree.pathDiagnosisPickerCursor}
                    cursor={pathDiagnosisCursor}
                    items={diagnosesList}
                    title="Pathlogical Diagnosis"
                    onPress={() => console.log('Pathlogical Diagnosis pressed')}
                />
                <InfoField
                    title={'Biopsy'}
                    controls={
                        <Switch
                            cursor={biopsyCursor}
                            items={[
                                { label: 'Yes', value: true },
                                { label: 'No', value: false },
                            ]}
                        />
                    }
                />
                {biopsyCursor.get() ?
                    <Picker
                        tree={this.props.tree.lesionsSizePickerCursor}
                        cursor={lesionsSizeCursor}
                        items={units === 'in' ? lesionsSizeIN : lesionsSizeCM}
                        title="Lesions Size"
                        onPress={() => console.log('Pathlogical Diagnosis pressed')}
                    />
                : null}
            </View>
        );
    },

    render() {
        return (
            <View style={s.container}>
                <ScrollView scrollEventThrottle={200}>
                    <View style={s.inner}>
                        <Gallery />
                        <Prediction />
                        <View style={s.distantPhoto} />
                        {this.renderFields()}
                    </View>
                </ScrollView>
            </View>
        );
    },
}));

export default Mole;
