import React from 'react';
import BaobabPropTypes from 'baobab-prop-types';
import {
    View,
} from 'react-native';
import schema from 'libs/state';
import { InfoField, Switch } from 'components';
import { convertInToCm, convertCmToIn } from 'libs/misc';
import DiagnosisScreen from './components/diagnosis-screen';
import LesionsScreen from './components/lesions-screen';
import s from './styles';

const model = {
    tree: {
        clinicalDiagnosis: {},
        pathDiagnosis: {},
        biopsyData: {},
    },
};

const InfoFields = schema(model)(React.createClass({
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
        const unitsOfLength = this.context.user.get('unitsOfLength');
        let width = biopsyData.width;
        let height = biopsyData.height;

        if (unitsOfLength === 'in') {
            width = convertInToCm(biopsyData.width);
            height = convertInToCm(biopsyData.height);
        }

        this.onDataChange({ biopsyData: { width, height } }, () => this.props.navigator.pop());
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

    convertUnits() {
        const fieldsDataCursor = this.props.tree.select('info', 'data');
        const biopsyDataCursor = fieldsDataCursor.select('biopsyData');
        const biopsyDataWidth = biopsyDataCursor.get('width');
        const biopsyDataHeight = biopsyDataCursor.get('height');
        const unitsOfLength = this.context.user.get('unitsOfLength');

        let width = biopsyDataWidth;
        let height = biopsyDataHeight;

        if (biopsyDataWidth && biopsyDataHeight) {
            if (unitsOfLength === 'in') {
                width = convertCmToIn(biopsyDataWidth);
                height = convertCmToIn(biopsyDataHeight);
            }
        }

        return { width, height };
    },

    renderLesionsField() {
        const fieldsDataCursor = this.props.tree.select('info', 'data');
        const biopsyDataCursor = fieldsDataCursor.select('biopsyData');
        const formBiopsyDataCursor = this.props.tree.select('biopsyData');
        const unitsOfLength = this.context.user.get('unitsOfLength');

        const convertedUnits = this.convertUnits();
        const width = convertedUnits.width;
        const height = convertedUnits.height;

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

        return (
            <View style={s.fields}>
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

                {biopsyCursor.get() ? this.renderLesionsField() : null}
            </View>
        );
    },
}));

export default InfoFields;
