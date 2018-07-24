import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Dimensions,
} from 'react-native';

import { TutorialPage } from './page';

import s from './styles';
import first from './images/first.svg';


const pagesContent = {
    doctor: [
        {
            image: first,
            header: 'Welcome to Skin!',
            text: 'Collect & Analyze patient data.',
        },
        {
            image: first,
            header: 'Take part in studies',
            text: 'Navigate over available studies on your profile page.',
        },
        {
            image: first,
            header: 'Manage patients',
            text: 'Create new patients and invite them to studies.',
        },
        {
            image: first,
            header: 'Collect skin images',
            text: 'Select a body part on the patient 3D model and take a photo of a skin.',
        },
        {
            image: first,
            header: 'Advanced features',
            text: 'Export the private key on your profile page if you need to use the web version of the system.',
        },
    ],
};


export const TutorialScreen = createReactClass({
    displayName: 'TutorialScreen',

    propTypes: {
        type: PropTypes.string.isRequired,
    },

    getInitialState() {
        return {
            currentPage: 0,
        };
    },

    handleScroll(event) {
        const e = event.nativeEvent;
        const scrollViewWidth = e.layoutMeasurement.width;
        const scrollX = e.contentOffset.x;

        this.setState({
            currentPage: Math.floor((scrollX / scrollViewWidth) + 0.5),
        });
    },

    scrollToEnd() {
        if (this.scrollView) {
            this.scrollView.scrollToEnd({ animated: true });
        }
    },

    render() {
        const { currentPage } = this.state;
        const pages = pagesContent[this.props.type];
        const windowWidth = Dimensions.get('window').width;

        return (
            <View style={s.container}>
                <ScrollView
                    ref={(ref) => { this.scrollView = ref; }}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    snapToInterval={windowWidth}
                    decelerationRate={0}
                    snapToAlignment={'center'}
                    scrollEventThrottle={32}
                    onScroll={this.handleScroll}
                >
                    {_.map(pages, (page, index) => (
                        <TutorialPage
                            key={`page-${index}`}
                            image={page.image}
                            header={page.header}
                            text={page.text}
                        />
                    ))}
                </ScrollView>

                <View style={s.dots}>
                    {_.map(pages, (page, index) => (
                        <View
                            key={`dot-${index}`}
                            style={[s.dot, index === currentPage ? s.dotActive : {}]}
                        />
                    ))}
                </View>

                {currentPage === pages.length - 1 ?
                    <TouchableOpacity
                        activeOpacity={0.5}
                        style={[s.bottomButton, s.bottomButtonLast]}
                    >
                        <Text
                            style={[s.bottomButtonText, s.bottomButtonTextLast]}
                        >
                            GOT IT
                        </Text>
                    </TouchableOpacity>
                :
                    <TouchableOpacity
                        activeOpacity={0.5}
                        style={s.bottomButton}
                        onPress={() => this.scrollToEnd()}
                    >
                        <Text style={s.bottomButtonText}>
                            SKIP
                        </Text>
                    </TouchableOpacity>
                }
            </View>
        );
    },
});
