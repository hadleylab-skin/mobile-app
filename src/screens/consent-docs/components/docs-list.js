import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import {
    Text,
    ScrollView,
} from 'react-native';
import OpenFile from 'react-native-doc-viewer';
import schema from 'libs/state';
import { InfoField } from 'components';
import s from '../styles';


export const ConsentDocsList = createReactClass({
    propTypes: {
        consentDocs: PropTypes.object.array, // eslint-disable-line
    },

    render() {
        return (
            <ScrollView>
                <Text style={s.text}>
                    Please, read these documents {'\n'} and confirm with sign
                </Text>
                {_.map(this.props.consentDocs, (consentDoc, index) => (
                    <InfoField
                        key={consentDoc.pk}
                        title={consentDoc.originalFilename || `Consent doc #${index}`}
                        text={'>'}
                        onPress={() => {
                            OpenFile.openDoc([{
                                url: consentDoc.file,
                                fileNameOptional: consentDoc.originalFilename || `Consent doc #${index}`,
                            }], () => {});
                        }}
                    />
                ))}
            </ScrollView>
        );
    },
});
