import React from 'react';
import _ from 'lodash';
import BaobabPropTypes from 'baobab-prop-types';
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

const Mole = schema({})(React.createClass({
    displayName: 'Mole',

    propTypes: {
        molePk: React.PropTypes.number.isRequired,
    },

    contextTypes: {
        mainNavigator: React.PropTypes.object.isRequired, // eslint-disable-line
        currentPatientPk: BaobabPropTypes.cursor.isRequired,
        services: React.PropTypes.shape({
            getMoleService: React.PropTypes.func.isRequired,
            updateMolePhotoService: React.PropTypes.func.isRequired,
        }),
    },

    getInitialState() {
        return {
            currentImageId: 0,
        };
    },

    async componentWillMount() {
        const patientPk = this.context.currentPatientPk.get();

        await this.context.services.getMoleService(
            patientPk,
            this.props.molePk,
            this.props.tree,
        );
    },

    setCurrentImageId(id) {
        this.setState({ currentImageId: id });
    },

    onBiopsyChange(value) {
        const { currentImageId } = this.state;
        const currentImageCursor = this.props.tree.select('data', 'images', currentImageId, 'data');
        const currentImageInfoCursor = currentImageCursor.select('info');
        const currentImageInfo = currentImageInfoCursor.get('data');

        currentImageInfoCursor.select('data', 'biopsy').set(value);

        this.onDataChange({
            biopsy: value,
            // biopsyData: currentImageInfo.biopsyData,
            clinicalDiagnosis: currentImageInfo.clinicalDiagnosis,
            pathDiagnosis: currentImageInfo.pathDiagnosis,
        });
    },

    async onDataChange(data) {
        const { currentImageId } = this.state;
        const patientPk = this.context.currentPatientPk.get();
        const molePk = this.props.tree.get('data', 'pk');
        const imagePk = this.props.tree.get('data', 'images', currentImageId, 'data', 'pk');
        const service = this.context.services.updateMolePhotoService;
        const imageInfoCursor = this.props.tree.select('data', 'images', currentImageId, 'data', 'info');

        await service(patientPk, molePk, imagePk, imageInfoCursor, { ...data });
    },

    renderFields() {
        const { currentImageId } = this.state;
        const currentImageCursor = this.props.tree.select('data', 'images', currentImageId, 'data');
        const biopsyCursor = currentImageCursor.select('info', 'data', 'biopsy');
        const clinicalDiagnosisCursor = this.props.tree.clinicalDiagnosis;
        const pathDiagnosisCursor = this.props.tree.pathDiagnosis;
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
                />*/}
                <InfoField
                    title={'Biopsy'}
                    controls={
                        <Switch
                            cursor={biopsyCursor}
                            disabled={currentImageCursor.get('info', 'status') === 'Loading'}
                            items={[
                                { label: 'Yes', value: true },
                                { label: 'No', value: false },
                            ]}
                            onPress={this.onBiopsyChange}
                        />
                    }
                />
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

    render() {
        const { currentImageId } = this.state;
        const { data } = this.props.tree.get();
        const images = data ? data.images : [];

        const currentImage = images[currentImageId];

        return (
            <View style={s.container}>
                <ScrollView scrollEventThrottle={200}>
                    <View style={s.inner}>
                        <Gallery
                            images={_.filter(images, (image) => image.data && image.data.dateCreated)}
                            currentImageId={currentImageId}
                            setCurrentImageId={this.setCurrentImageId}
                        />
                        {currentImage && currentImage.data ?
                            <View>
                                <Prediction {...currentImage.data} />
                                {/*<View style={s.distantPhoto} />*/}
                                {this.renderFields()}
                            </View>
                        : null}
                    </View>
                </ScrollView>
            </View>
        );
    },
}));

export default Mole;
