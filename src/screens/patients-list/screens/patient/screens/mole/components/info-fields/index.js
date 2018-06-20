import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import BaobabPropTypes from 'baobab-prop-types';
import createReactClass from 'create-react-class';
import {
    View,
} from 'react-native';
import schema from 'libs/state';
import { InfoField, Switch } from 'components';
import { convertInToCm, convertCmToIn } from 'libs/misc';
import { getDiagnosisScreenRoute } from '../../screens/diagnosis-screen';
import { getLesionsScreenRoute } from '../../screens/lesions-screen';
import s from './styles';

const model = {
    tree: {
        clinicalDiagnosis: {},
        pathDiagnosis: {},
        biopsyData: {},
    },
};

const InfoFields = schema(model)(createReactClass({
    propTypes: {
        molePk: PropTypes.number.isRequired,
        imagePk: PropTypes.number.isRequired,
        navigator: PropTypes.object.isRequired, // eslint-disable-line
        currentImage: PropTypes.object.isRequired,
    },

    contextTypes: {
        cursors: PropTypes.shape({
            currentPatientPk: BaobabPropTypes.cursor.isRequired,
            currentStudyPk: BaobabPropTypes.cursor.isRequired,
            patients: BaobabPropTypes.cursor.isRequired,
            patientsMoles: BaobabPropTypes.cursor.isRequired,
            doctor: BaobabPropTypes.cursor.isRequired,
            filter: PropTypes.object.isRequired, // eslint-disable-line,
        }),
        services: PropTypes.shape({
            patientsService: PropTypes.func.isRequired,
            updateMolePhotoService: PropTypes.func.isRequired,
            getPatientMolesService: PropTypes.func.isRequired,
        }),
    },

    componentWillMount() {
        this.props.tree.on('update', this.updatePatients);
        this.context.cursors.doctor.on('update', this.onDoctorHasChanged);
    },

    componentWillUnmount() {
        this.props.tree.off('update', this.updatePatients);
        this.context.cursors.doctor.off('update', this.onDoctorHasChanged);
    },

    onDoctorHasChanged() {
        this.forceUpdate();
    },

    async updatePatients() {
        const { cursors, services } = this.context;
        await services.patientsService(cursors.patients,
            cursors.filter.get(), cursors.currentStudyPk.get('data'));
    },

    onBiopsyChange(value) {
        const imageInfoCursor = this.props.tree.select('info');

        imageInfoCursor.select('data', 'biopsy').set(value);

        this.onDataChange({ biopsy: value });
    },

    onBiopsyDataSubmit() {
        const biopsyData = this.props.tree.get('biopsyData');
        const unitsOfLength = this.context.cursors.doctor.get('unitsOfLength');
        let width = biopsyData.width;
        let height = biopsyData.height;

        if (unitsOfLength === 'in') {
            width = convertInToCm(biopsyData.width);
            height = convertInToCm(biopsyData.height);
        }

        this.onDataChange({ biopsyData: { width, height } }, () => this.props.navigator.pop());
    },

    onDiagnosisSubmit() {
        const { cursors, services } = this.context;
        const clinicalDiagnosis = this.props.tree.get('clinicalDiagnosis', 'text');
        const pathDiagnosis = this.props.tree.get('pathDiagnosis', 'text');
        const patientPk = cursors.currentPatientPk.get();

        this.onDataChange(
            { clinicalDiagnosis, pathDiagnosis },
            async () => {
                this.props.navigator.pop();
                await services.getPatientMolesService(
                    patientPk,
                    cursors.patientsMoles.select(patientPk, 'moles'),
                    cursors.currentStudyPk.get('data')
                );
            }
        );
    },

    async onDataChange(data, onSuccess) {
        const { molePk, imagePk } = this.props;
        const patientPk = this.context.cursors.currentPatientPk.get();
        const service = this.context.services.updateMolePhotoService;
        const imageInfoCursor = this.props.tree.select('info');
        const result = await service(patientPk, molePk, imagePk, imageInfoCursor, data);

        if (result.status === 'Succeed' && onSuccess) {
            onSuccess();
        }
    },

    convertUnits() {
        const fieldsDataCursor = this.props.tree.select('info', 'data');
        const biopsyData = fieldsDataCursor.get('biopsyData');
        const unitsOfLength = this.context.cursors.doctor.get('unitsOfLength');

        let width = (biopsyData && biopsyData.width) || '';
        let height = (biopsyData && biopsyData.height) || '';

        if (width && height) {
            if (unitsOfLength === 'in') {
                width = convertCmToIn(width);
                height = convertCmToIn(height);
            }
        }

        return { width, height };
    },

    renderLesionsField() {
        const fieldsDataCursor = this.props.tree.select('info', 'data');
        const biopsyDataCursor = fieldsDataCursor.select('biopsyData');
        const formBiopsyDataCursor = this.props.tree.select('biopsyData');
        const unitsOfLength = this.context.cursors.doctor.get('unitsOfLength');

        const convertedUnits = this.convertUnits();

        const width = convertedUnits.width;
        const height = convertedUnits.height;

        return (
            <InfoField
                title="Lesions Size"
                text={width && height ? `width: ${width} ${unitsOfLength}, height: ${height} ${unitsOfLength}` : ''}
                onPress={() => {
                    this.props.navigator.push(
                        getLesionsScreenRoute({
                            cursor: formBiopsyDataCursor,
                            data: biopsyDataCursor.get(),
                            onSubmit: this.onBiopsyDataSubmit,
                            navigator: this.props.navigator,
                        })
                    );
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
                    this.props.navigator.push(
                        getDiagnosisScreenRoute({
                            cursor: this.props.tree.select(cursorName),
                            text: diagnosisCursor.get(),
                            title,
                            onSubmit: this.onDiagnosisSubmit,
                            navigator: this.props.navigator,
                        })
                    );
                }}
            />
        );
    },

    renderStudy() {
        const { currentImage } = this.props;
        if (currentImage.data && !_.isEmpty(currentImage.data.study)) {
            return (
                <InfoField
                    title="Study"
                    text={currentImage.data.study.title}
                />
            );
        }
    },

    render() {
        const fieldsDataCursor = this.props.tree.select('info', 'data');
        const biopsyCursor = fieldsDataCursor.select('biopsy');

        return (
            <View style={s.fields}>
                {this.renderDiagnosisField('clinicalDiagnosis', 'Clinical Diagnosis')}
                {this.renderDiagnosisField('pathDiagnosis', 'Pathology Diagnosis')}

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

                {this.renderStudy()}
            </View>
        );
    },
}));

export default InfoFields;
