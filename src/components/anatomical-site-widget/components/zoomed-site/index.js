import React from 'react';
import _ from 'lodash';
import BaobabPropTypes from 'baobab-prop-types';
import {
    Image,
    View,
    Text,
    TouchableOpacity,
} from 'react-native';
import schema from 'libs/state';
import { Button } from 'components/new/button';
import ImagePicker from 'react-native-image-picker';
import MolePicker from '../mole-picker';
import s from './styles';

const model = {
    tree: {
        mole: {},
    },
};

const ZoomedSite = schema(model)(React.createClass({
    displayName: 'ZoomedSite',

    propTypes: {
        source: React.PropTypes.number.isRequired,
        label: React.PropTypes.string.isRequired,
        onAddingComplete: React.PropTypes.func.isRequired,
    },

    contextTypes: {
        currentPatientPk: BaobabPropTypes.cursor.isRequired,
        services: React.PropTypes.shape({
            addMoleService: React.PropTypes.func.isRequired,
        }),
    },

    getInitialState() {
        return {
            positionX: null,
            positionY: null,
            userSiteImage: null,
        };
    },

    onAddDistantPhoto(userSiteImage) {
        this.setState({ userSiteImage });
    },

    onContinuePress() {
        ImagePicker.launchCamera({}, (response) => this.onSubmitMolePhoto(response.uri));
    },

    async onSubmitMolePhoto(uri) {
        const { positionX, positionY } = this.state;

        const data = {
            anatomicalSite: _.kebabCase(this.props.label),
            positionX: parseInt(positionX, 10),
            positionY: parseInt(positionY, 10),
            uri,
        };

        const service = this.context.services.addMoleService;
        const patientPk = this.context.currentPatientPk.get();
        const result = await service(patientPk, this.props.tree.mole, data);

        if (result.status === 'Succeed') {
            this.props.onAddingComplete();
        }
    },

    onMolePick(positionX, positionY) {
        this.setState({ positionX, positionY });
    },

    render() {
        const { source } = this.props;
        const { positionX, positionY, userSiteImage } = this.state;
        const hasMoleLocation = positionX && positionY;

        return (
            <View style={s.container}>
                <View style={s.wrapper}>
                    <MolePicker onMolePick={this.onMolePick}>
                        <Image
                            source={userSiteImage ? { uri: userSiteImage } : source}
                            style={userSiteImage ? s.imageURI : {}}
                        />
                    </MolePicker>
                    <View style={s.footer}>
                        {hasMoleLocation ?
                            <Button type="rect" title="Continue" onPress={this.onContinuePress} />
                        : null }
                        {!hasMoleLocation ?
                            <View style={s.footerInner}>
                                {userSiteImage ?
                                    <Text style={s.text}>Tap on location</Text>
                                :
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={s.text}>Tap on location or{' '}</Text>
                                        <TouchableOpacity
                                            style={s.textButton}
                                            onPress={() => ImagePicker.launchCamera({},
                                                (response) => this.onAddDistantPhoto(response.uri))}
                                        >
                                            <Text style={[s.text, s.textPink]}>take a distant photo</Text>
                                        </TouchableOpacity>
                                    </View>
                                }
                            </View>
                        : null}
                    </View>
                </View>
            </View>
        );
    },
}));

export default ZoomedSite;
