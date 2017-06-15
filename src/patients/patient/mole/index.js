import React from 'react';
import _ from 'lodash';
import BaobabPropTypes from 'baobab-prop-types';
import {
    View,
    ScrollView,
} from 'react-native';
import schema from 'libs/state';
import Gallery from './components/gallery';
import Prediction from './components/prediction';
import InfoFields from './components/info-fields';
import s from './styles';

const Mole = schema({})(React.createClass({
    displayName: 'Mole',

    propTypes: {
        molePk: React.PropTypes.number.isRequired,
        navigator: React.PropTypes.object.isRequired, // eslint-disable-line
    },

    contextTypes: {
        currentPatientPk: BaobabPropTypes.cursor.isRequired,
        services: React.PropTypes.shape({
            getMoleService: React.PropTypes.func.isRequired,
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
                                <InfoFields
                                    tree={this.props.tree.select('data', 'images', currentImageId, 'data')}
                                    molePk={this.props.molePk}
                                    imagePk={this.props.tree.get('data', 'images', currentImageId, 'data', 'pk')}
                                    navigator={this.props.navigator}
                                />
                            </View>
                        : null}
                    </View>
                </ScrollView>
            </View>
        );
    },
}));

export default Mole;
