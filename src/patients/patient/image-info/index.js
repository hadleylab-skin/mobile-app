import React from 'react';
import BaobabPropTypes from 'baobab-prop-types';
import {
    View,
    Text,
    Image,
    Switch,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import moment from 'moment';
import schema from 'libs/state';
import { Input, Picker } from 'components';
import s from './styles';

const model = (props) => {
    const data = props.cursor.data;

    return {
        tree: {
            form: {
                diagnosis: data.get('clinical_diagnosis'),
                anatomicalSite: data.get('anatomical_site'),
                biopsy: data.get('biopsy'),
            },
            offsetY: 0,
            anatomicalSitePickerCursor: {},
        },
    };
};
const ImageInfo = schema(model)(React.createClass({
    displayName: 'ImageInfo',

    propTypes: {
        cursor: BaobabPropTypes.cursor.isRequired,
        patientPk: React.PropTypes.number.isRequired,
        imageService: React.PropTypes.func.isRequired,
        anatomicalSites: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
    },

    getInitialState() {
        return {
            canUpdate: true,
        };
    },

    updateImage() {
        return this.props.imageService(
            this.props.patientPk,
            this.props.cursor.get('data', 'id'),
            this.props.cursor);
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
        const {
            date_created, clinical_diagnosis,
            prediction_accuracy, prediction,
            clinical_photo,
        } = this.props.cursor.get('data');
        const showLoader = this.props.cursor.status.get() === 'Loading';
        const diagnosisCursor = this.props.tree.form.diagnosis;
        const anatomicalSiteCursor = this.props.tree.form.anatomicalSite;
        const biopsyCursor = this.props.tree.form.biopsy;
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
                    <View style={{ marginBottom: 40 }}>
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
                            <Text style={[s.text, s.textRight]}>Clinical diagnosis:</Text>
                            <Text style={s.text}>{clinical_diagnosis}</Text>
                        </View>
                        <View style={s.table}>
                            <Text style={[s.text, s.textRight]}>Prediction accuracy:</Text>
                            <Text style={s.text}>{prediction_accuracy}</Text>
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
                                cursor={diagnosisCursor}
                                inputWrapperStyle={[s.wrapper, s.wrapperFull]}
                                inputStyle={s.input}
                                placeholderTextColor="#ccc"
                            />
                        </View>
                        <View style={s.group}>
                            <View style={s.groupTitleWrapper}>
                                <Text style={s.groupTitle}>Image Information</Text>
                            </View>
                            <Picker
                                tree={this.props.tree.anatomicalSitePickerCursor}
                                cursor={anatomicalSiteCursor}
                                items={this.props.anatomicalSites}
                                title="Anatomical Site"
                                onPress={() => { this.scrollView.scrollTo({ y: offsetY + 220, animated: true }); }}
                            />
                            <View style={s.wrapper}>
                                <Text style={s.groupTitle}>Biopsy:</Text>
                                <Switch
                                    onValueChange={(value) => biopsyCursor.set(value)}
                                    value={biopsyCursor.get()}
                                />
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </View>
        );
    },
}));

export default ImageInfo;
