import React from 'react';
import BaobabPropTypes from 'baobab-prop-types';
import {
    View,
    Text,
    Image,
    ActivityIndicator,
    Alert,
    TouchableWithoutFeedback,
} from 'react-native';
import _ from 'lodash';
import moment from 'moment';
import schema from 'libs/state';
import { UserPropType } from 'libs/misc';
import { Form, Input, Switch, AnatomicalSiteWidget } from 'components';
import tv4 from 'tv4';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
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
        currentAnatomicalSite: '',
    },
};

const ImageInfo = schema(model)(React.createClass({
    displayName: 'ImageInfo',

    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        cursor: BaobabPropTypes.cursor.isRequired,
        patientPk: React.PropTypes.number.isRequired,
        anatomicalSiteList: React.PropTypes.arrayOf(React.PropTypes.arrayOf(React.PropTypes.string)).isRequired,
        registerGetInput: React.PropTypes.func.isRequired,
        doSubmit: React.PropTypes.func.isRequired,
        navigator: React.PropTypes.object.isRequired, // eslint-disable-line
    },

    contextTypes: {
        user: UserPropType,
        services: React.PropTypes.shape({
            getImageService: React.PropTypes.func.isRequired,
        }),
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
        tree.currentAnatomicalSite.set(data.get('anatomical_site'));
    },

    updateImage() {
        return this.context.services.getImageService(
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

    renderAnatomicalSite() {
        const anatomicalSiteCursor = this.props.tree.currentAnatomicalSite;
        const { navigator } = this.props;

        return (
            <TouchableWithoutFeedback
                onPress={() => navigator.push({
                    component: AnatomicalSiteWidget,
                    title: 'Anatomical site',
                    leftButtonTitle: 'Cancel',
                    onLeftButtonPress: () => navigator.pop(),
                    onRightButtonPress: () => {
                        this.props.tree.form.anatomical_site.set(anatomicalSiteCursor.get());
                        navigator.pop();
                    },
                    navigationBarHidden: false,
                    rightButtonTitle: 'Update',
                    tintColor: '#FF2D55',
                    passProps: {
                        tree: this.props.tree,
                        cursor: anatomicalSiteCursor,
                    },
                })}
            >
                <View style={[s.wrapper, { flexDirection: 'row', alignItems: 'center' }]}>
                    <Text style={[s.groupTitle, { paddingTop: 7, paddingBottom: 8 }]}>Anatomical Site:</Text>
                    <Text style={s.groupText}>{this.props.tree.form.anatomical_site.get()}</Text>
                </View>
            </TouchableWithoutFeedback>
        );
    },

    render() {
        const { date_created, prediction, clinical_photo } = this.props.cursor.get('data');
        const predictionAccuracy = this.props.cursor.get('data', 'prediction_accuracy');

        const clinicalDiagnosisCursor = this.props.tree.form.clinical_diagnosis;
        const biopsyCursor = this.props.tree.form.biopsy;

        const showLoader = this.props.cursor.status.get() === 'Loading';
        const offsetY = this.props.tree.offsetY.get();

        const canSeePrediction = (
            this.context.user.can_see_prediction
            && typeof predictionAccuracy !== 'undefined');
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
                <KeyboardAwareScrollView
                    onScroll={this.onScroll}
                    scrollEventThrottle={200}
                    ref={(ref) => { this.scrollView = ref; }}
                    enableAutoAutomaticScroll={false}
                >
                    <Form
                        style={{ marginBottom: 40 }}
                        onSubmit={this.props.doSubmit}
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
                        {
                                canSeePrediction
                            ?
                                <View>
                                    <View style={s.table}>
                                        <Text style={[s.text, s.textRight]}>Prediction accuracy:</Text>
                                        <Text style={s.text}>{predictionAccuracy}</Text>
                                    </View>
                                    <View style={s.table}>
                                        <Text style={[s.text, s.textRight]}>Prediction:</Text>
                                        <Text style={s.text}>{prediction}</Text>
                                    </View>
                                </View>
                            :
                                null
                        }
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
                                returnKeyType="next"
                                name="clinical_diagnosis"
                                onFocus={() => this.scrollView.scrollToPosition(0, 278)}
                            />
                        </View>
                        <View style={s.group}>
                            <View style={s.groupTitleWrapper}>
                                <Text style={s.groupTitle}>Image Information</Text>
                            </View>

                            {this.renderAnatomicalSite()}

                            <View style={[s.wrapper, { flexDirection: 'row', alignItems: 'center' }]}>
                                <Text style={s.groupTitle}>Biopsy:</Text>
                                <Switch
                                    cursor={biopsyCursor}
                                />
                            </View>
                        </View>
                    </Form>
                </KeyboardAwareScrollView>
            </View>
        );
    },
}));

async function submit(props, context, getInput) {
    const formData = props.tree.form.get();
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

        const firstErrorPath = validationResult.errors[0].dataPath.substr(1);
        getInput(firstErrorPath).focus();

        return;
    }

    const imagePk = props.cursor.get('data', 'id');
    const patientPk = props.patientCursor.get('data', 'id');
    const result = await context.services.updateImageService(patientPk, imagePk, props.cursor, formData);

    if (result.status === 'Failure') {
        Alert.alert(
            'Update Image Error',
            JSON.stringify(result.error));
    } else {
        props.navigator.pop();
    }
}


export function getRoute(props, context) {
    const { firstname, lastname, id } = props.patientCursor.get('data');
    const navigator = props.navigator;

    let getInput;

    const doSubmit = async () => submit(props, context, getInput);

    const passProps = {
        doSubmit,
        tree: props.tree,
        cursor: props.cursor,
        patientPk: id,
        anatomicalSiteList: props.anatomicalSiteList,
        registerGetInput: (_getInput) => { getInput = _getInput; },
    };

    return {
        component: ImageInfo,
        title: `${firstname} ${lastname}`,
        onLeftButtonPress: () => navigator.pop(),
        navigationBarHidden: false,
        rightButtonTitle: 'Update',
        onRightButtonPress: doSubmit,
        tintColor: '#FF2D55',
        passProps,
    };
}
