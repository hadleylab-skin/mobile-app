import React from 'react';
import _ from 'lodash';
import BaobabPropTypes from 'baobab-prop-types';
import {
    View,
    Text,
    Image,
} from 'react-native';
import schema from 'libs/state';
import { InfoField, Switch, Picker, AnatomicalSiteWidget } from 'components';
import arrowImage from 'components/icons/arrow/arrow.png';
import { UserPropType } from 'libs/misc';
import DiagnosisScreen from './components/diagnosis-screen';
import LesionsScreen from './components/lesions-screen';
import s from './styles';

const model = (props) => ({
    tree: {
        clinicalDiagnosis: props.tree.get('info', 'data', 'clinicalDiagnosis'),
        pathDiagnosis: props.tree.get('info', 'data', 'pathDiagnosis'),
        biopsyData: props.tree.get('info', 'data', 'biopsyData'),
    },
});

const InfoFields = schema(model)(React.createClass({
    displayName: 'Mole',

    propTypes: {
        molePk: React.PropTypes.number.isRequired,
        imagePk: React.PropTypes.number.isRequired,
        navigator: React.PropTypes.object.isRequired, // eslint-disable-line
    },

    contextTypes: {
        currentPatientPk: BaobabPropTypes.cursor.isRequired,
        patientsMoles: BaobabPropTypes.cursor.isRequired,
        user: BaobabPropTypes.cursor.isRequired,
        services: React.PropTypes.shape({
            updateMolePhotoService: React.PropTypes.func.isRequired,
            getPatientMolesService: React.PropTypes.func.isRequired,
        }),
    },

    componentWillMount() {
        this.context.user.on('update', this.update);
    },

    componentWillUnmount() {
        this.context.user.off('update', this.update);
    },

    update() {
        this.forceUpdate();
    },

    onBiopsyChange(value) {
        const imageInfoCursor = this.props.tree.select('info');

        imageInfoCursor.select('data', 'biopsy').set(value);

        this.onDataChange({ biopsy: value });
    },

    onBiopsyDataSubmit() {
        const biopsyData = this.props.tree.get('biopsyData');

        this.onDataChange({ biopsyData }, () => this.props.navigator.pop());
    },

    onDiagnosisSubmit() {
        const clinicalDiagnosis = this.props.tree.get('clinicalDiagnosis');
        const pathDiagnosis = this.props.tree.get('pathDiagnosis');
        const patientPk = this.context.currentPatientPk.get();

        this.onDataChange(
            { clinicalDiagnosis, pathDiagnosis },
            async () => {
                this.props.navigator.pop();
                await this.context.services.getPatientMolesService(
                    patientPk,
                    this.context.patientsMoles.select(patientPk, 'moles')
                );
            }
        );
    },

    async onDataChange(data, onSuccess) {
        const { molePk, imagePk } = this.props;
        const patientPk = this.context.currentPatientPk.get();
        const service = this.context.services.updateMolePhotoService;
        const imageInfoCursor = this.props.tree.select('info');

        const result = await service(patientPk, molePk, imagePk, imageInfoCursor, { ...data });

        if (result.status === 'Succeed' && onSuccess) {
            onSuccess();
        }
    },

    renderLesionsField() {
        const fieldsDataCursor = this.props.tree.select('info', 'data');
        const biopsyDataCursor = fieldsDataCursor.select('biopsyData');
        const formBiopsyDataCursor = this.props.tree.select('biopsyData');
        const unitsOfLength = this.context.user.get('unitsOfLength');

        const width = biopsyDataCursor.get('width');
        const height = biopsyDataCursor.get('height');

        return (
            <InfoField
                title="Lesions Size"
                text={width && height ? `width: ${width} ${unitsOfLength}, height: ${height} ${unitsOfLength}` : ''}
                onPress={() => {
                    this.props.navigator.push({
                        component: LesionsScreen,
                        title: 'Lesions Size',
                        onLeftButtonPress: () => {
                            this.props.navigator.pop();
                        },
                        navigationBarHidden: false,
                        leftButtonIcon: require('components/icons/back/back.png'),
                        tintColor: '#FF1D70',
                        passProps: {
                            widthCursor: formBiopsyDataCursor.select('width'),
                            heightCursor: formBiopsyDataCursor.select('height'),
                            width: biopsyDataCursor.get('width'),
                            height: biopsyDataCursor.get('height'),
                            onSubmit: this.onBiopsyDataSubmit,
                        },
                    });
                }}
            />
        );
    },

    renderDiagnosisField(cursorName, title) {
        const fieldsDataCursor = this.props.tree.select('info', 'data');
        const diagnosisCursor = fieldsDataCursor.select(cursorName);

        return (
            <InfoField
                title={title}
                text={diagnosisCursor.get()}
                onPress={() => {
                    this.props.navigator.push({
                        component: DiagnosisScreen,
                        title,
                        onLeftButtonPress: () => this.props.navigator.pop(),
                        navigationBarHidden: false,
                        leftButtonIcon: require('components/icons/back/back.png'),
                        tintColor: '#FF1D70',
                        passProps: {
                            cursor: this.props.tree.select(cursorName),
                            text: diagnosisCursor.get(),
                            title,
                            onSubmit: this.onDiagnosisSubmit,
                        },
                    });
                }}
            />
        );
    },

    render() {
        const fieldsDataCursor = this.props.tree.select('info', 'data');
        const biopsyCursor = fieldsDataCursor.select('biopsy');
        const lesionsSizeCursor = this.props.tree.lesionsSize;

        const units = 'in'; /* in || cm */

        return (
            <View style={s.fields}>
                {/*<InfoField
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
                            tintColor: '#FF1D70',
                            passProps: {
                                tree: this.props.tree,
                                onAddingComplete: () => this.context.mainNavigator.pop(),
                            },
                        });
                    }}
                />*/}

                {this.renderDiagnosisField('clinicalDiagnosis', 'Clinical Diagnosis')}
                {this.renderDiagnosisField('pathDiagnosis', 'Pathlogical Diagnosis')}

                <InfoField
                    title={'Biopsy'}
                    controls={
                        <Switch
                            cursor={biopsyCursor}
                            disabled={this.props.tree.get('info', 'status') === 'Loading'}
                            items={[
                                { label: 'Yes', value: true },
                                { label: 'No', value: false },
                            ]}
                            onPress={this.onBiopsyChange}
                        />
                    }
                />

                {this.renderLesionsField()}

                {/*biopsyCursor.get() ?
                    <Picker
                        tree={this.props.tree.lesionsSizePickerCursor}
                        cursor={lesionsSizeCursor}
                        items={units === 'in' ? lesionsSizeIN : lesionsSizeCM}
                        title="Lesions Size"
                        onPress={() => console.log('Pathlogical Diagnosis pressed')}
                    />
                : null*/}
            </View>
        );
    },
}));

export default InfoFields;
