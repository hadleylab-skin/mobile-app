import React from 'react';
import BaobabPropTypes from 'baobab-prop-types';
import {
    View,
    Text,
    Image,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import _ from 'lodash';
import moment from 'moment';
import schema from 'libs/state';
import { Form, Input, Picker, Switch } from 'components';
import tv4 from 'tv4';
import s from './styles';

const updateImageSchema = {
    title: 'Update image form',
    type: 'object',
    properties: {
        clinical_diagnosis: {
            type: 'string',
            minLength: 2,
        },
    },
    required: ['clinical_diagnosis'],
};

const model = {
    tree: {
        form: {
            clinical_diagnosis: '',
            anatomical_site: '',
            biopsy: '',
        },
        offsetY: 0,
        anatomicalSitePickerCursor: {},
    },
};

const ImageInfo = schema(model)(React.createClass({
    displayName: 'ImageInfo',

    propTypes: {
        cursor: BaobabPropTypes.cursor.isRequired,
        patientPk: React.PropTypes.number.isRequired,
        getImageService: React.PropTypes.func.isRequired,
        anatomicalSiteList: React.PropTypes.arrayOf(React.PropTypes.arrayOf(React.PropTypes.string)).isRequired,
        registerGetInput: React.PropTypes.func.isRequired,
    },

    getInitialState() {
        return {
            canUpdate: true,
        };
    },

    componentWillMount() {
        const data = this.props.cursor.data;
        const tree = this.props.tree;

        tree.form.set({
            clinical_diagnosis: data.get('clinical_diagnosis'),
            anatomical_site: data.get('anatomical_site'),
            biopsy: data.get('biopsy'),
        });
        tree.anatomicalSitePickerCursor.isOpen.set(false);
    },

    updateImage() {
        return this.props.getImageService(
            this.props.patientPk,
            this.props.cursor.get('data', 'id'),
            this.props.cursor);
    },

    registerGetInput(ref) {
        if (ref) {
            this.props.registerGetInput(ref.getInput.bind(ref));
        }
    },

    async onScroll(e) {
        const offset = e.nativeEvent.contentOffset.y;
        this.props.tree.offsetY.set(offset);

        if (offset < -130 && this.state.canUpdate && this.props.cursor.status.get() !== 'Loading') {
            this.setState({ canUpdate: false });
            await this.updateImage();
        }
        if (offset > -70) {
            this.setState({ canUpdate: true });
        }
    },

    render() {
        const { date_created, prediction, clinical_photo } = this.props.cursor.get('data');
        const predictionAccuracy = this.props.cursor.get('data', 'prediction_accuracy');

        const clinicalDiagnosisCursor = this.props.tree.form.clinical_diagnosis;
        const anatomicalSiteCursor = this.props.tree.form.anatomical_site;
        const biopsyCursor = this.props.tree.form.biopsy;

        const showLoader = this.props.cursor.status.get() === 'Loading';
        const offsetY = this.props.tree.offsetY.get();

        return (
            <View style={s.container}>
                { showLoader ?
                    <View style={s.activityIndicator}>
                        <ActivityIndicator
                            animating={showLoader}
                            size="large"
                            color="#FF2D55"
                        />
                    </View>
                :
                    null
                }
                <ScrollView
                    onScroll={this.onScroll}
                    scrollEventThrottle={200}
                    ref={(ref) => { this.scrollView = ref; }}
                >
                    <Form
                        style={{ marginBottom: 40 }}
                        onSubmit={() => console.log('submit')}
                        ref={this.registerGetInput}
                    >
                        <View style={s.imageWrapper}>
                            <View style={s.indicator}>
                                <ActivityIndicator
                                    animating
                                    size="large"
                                    color="#FF2D55"
                                />
                            </View>
                            <Image
                                source={{ uri: clinical_photo.full_size }}
                                style={s.photo}
                            />
                        </View>
                        <View style={s.table}>
                            <Text style={[s.text, s.textRight]}>Uploaded on:</Text>
                            <Text style={s.text}>{moment(date_created).format('DD MMM YYYY')}</Text>
                        </View>
                        <View style={s.table}>
                            <Text style={[s.text, s.textRight]}>Prediction accuracy:</Text>
                            <Text style={s.text}>{predictionAccuracy}</Text>
                        </View>
                        <View style={s.table}>
                            <Text style={[s.text, s.textRight]}>Prediction:</Text>
                            <Text style={s.text}>{prediction}</Text>
                        </View>
                        <View style={s.group}>
                            <View style={s.groupTitleWrapper}>
                                <Text style={s.groupTitle}>Clinical Diagnosis</Text>
                            </View>
                            <Input
                                label=""
                                cursor={clinicalDiagnosisCursor}
                                inputWrapperStyle={[s.wrapper, s.wrapperFull]}
                                inputStyle={s.input}
                                errorStyle={s.error}
                                placeholderTextColor="#ccc"
                                onFocus={() => { this.scrollView.scrollTo({ y: offsetY + 220, animated: true }); }}
                                returnKeyType="next"
                                name="clinical_diagnosis"
                            />
                        </View>
                        <View style={s.group}>
                            <View style={s.groupTitleWrapper}>
                                <Text style={s.groupTitle}>Image Information</Text>
                            </View>
                            <Picker
                                tree={this.props.tree.anatomicalSitePickerCursor}
                                cursor={anatomicalSiteCursor}
                                items={this.props.anatomicalSiteList}
                                title="Anatomical Site"
                                onPress={() => { this.scrollView.scrollTo({ y: offsetY + 220, animated: true }); }}
                            />
                            <View style={[s.wrapper, { flexDirection: 'row', alignItems: 'center' }]}>
                                <Text style={s.groupTitle}>Biopsy:</Text>
                                <Switch
                                    cursor={biopsyCursor}
                                />
                            </View>
                        </View>
                    </Form>
                </ScrollView>
            </View>
        );
    },
}));

export default ImageInfo;

export async function submit(patientPk, imagePk, cursor, updateImageService, navigator, getInput, tree) {
    const formData = tree.form.get();
    const validationResult = tv4.validateMultiple(formData, updateImageSchema);

    if (!validationResult.valid) {
        _.each(
            validationResult.errors,
            (error) => {
                const errorPath = error.dataPath;
                const errorMessage = error.message;
                const fieldName = errorPath.substr(1);

                getInput(fieldName).showError(errorMessage);
            });
        return;
    }

    const result = await updateImageService(patientPk, imagePk, cursor, formData);

    if (result.status === 'Failure') {
        Alert.alert(
            'Update Image Error',
            JSON.stringify(result.error));
    } else {
        navigator.pop();
    }
}
