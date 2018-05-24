import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import {
    View,
    Text,
    TouchableOpacity,
    WebView,
} from 'react-native';
import backIcon from 'components/icons/back/back.png';
import s from './styles';

const HTML = `
<h3>SKIN HADLEYLAB CONSENT TO ALLOW DIGITAL IMAGES OF SKIN LESIONS FOR RESEARCH</h3>
<h4>Study Title: Computer Vision Classification of Skin Lesions</h4>
This is a request that you allow the use of the de-identified data including digital image(s) of your skin lesions for medical research. 
Medical research includes only people who choose to take part. Take your time to make your decision about participating. you have any questions, You may discuss your decision with your family and friends and with your healthcare team. If you have any quest
You are being asked to take part in this study because you are/have moles, freckles and/or other skin lesions.
<h5>Why is this research being done?</h5>
The purpose of this study is to train computers to classify skin lesions. 
<h5>How many people will take part in this research?</h5>
About 1000 people will be asked to allow the images of their skin lesions to be used for research.
<h5>What will happen if I agree to allow image(s) of my skin lesion(s) to be used for research?</h5>
If you agree to let researchers use the spot image(s) of your skin lesions for future research, the following will happen:<br/>
• A digital image of selected skin lesions will be recorded.<br/>
• We may give the skin lesion images and certain medical information about you (for example, diagnosis) to other scientists or companies or research institutions. Reports about any research will not be given to you or your doctor.<br/>
• Your skin lesion images will be kept indefinitely. They may be used to develop new drugs, tests, treatments or products. In some instances these may have potential commercial value. Your personal health information cannot be used for additional research without additional approval from either you or a review committee.<br/>
• If you decide later that you do not want your skin lesion images and information to be used for future research, you can notify Skin Hadleylab at contact@hadleylab.com and we will destroy any remaining images and information if they are no longer needed for your care. However, if any research has already been done using your images, the data will be kept and analyzed as part of those research studies.<br/>
<h5>What risks are involved with participating in this research?</h5>
<i>Confidentiality: Participation may involve a loss of privacy, but information about you will be handled as confidentially as possible. Study data will be physically and electronically secured. As with any use of electronic means to store data, there is a risk of breach of data security. Your name will not be used in any</i>
<br/>
Published reports from research performed using your spot image(s). Skin Hadleylab will have access to information about you but will not release any identifying information about you to researchers except your spot photos.
<h5>What are the benefits of allowing use of my skin lesion images for research?</h5>
There will be no direct benefit to you. However, we hope we will learn something that will contribute to the advancement of science and understanding of health and disease.
<h5>What financial issues should I consider before donating?</h5>
You will not be charged or paid for allowing your skin lesion images to be used for research. If the data or any new products, tests or discoveries that result from this research have potential commercial value, you will not share in any financial benefits
What alternatives do I have?
If you choose not to allow the use of your skin lesion images for research, the images will only be used for your clinical care.
What are my rights if I take part in this study?
Taking part in this study is your choice. You may choose either to take part or not to take part in the study. No matter what decision you make, there will be no penalty to you and you will not lose any of your regular benefits. Leaving the study will not affect your medical care. You can still get your medical care from our institution.
In the case of injury resulting from this study, you do not lose any of your legal rights to seek payment by signing this form.
<h5>Who can answer my questions about the study?</h5>
You can talk with the study researcher about any questions, concerns or complaints you have about this study. Contact the study researcher Dr. Dexter Hadley at <a href="mailto:dexter.hadley@ucsf.edu">dexter.hadley@ucsf.edu</a>.
`;

const AgreementScreen = createReactClass({
    propTypes: {
        navigator: PropTypes.object.isRequired, // eslint-disable-line
        onAgree: PropTypes.func.isRequired,
    },
    render() {
        return (
            <View style={s.container}>
                <View style={s.webViewWrapper}>
                    <WebView
                        source={{ html: HTML }}
                        automaticallyAdjustContentInsets={false}
                    />
                </View>
                <View style={s.buttons}>
                    <TouchableOpacity
                        activeOpacity={0.5}
                        style={s.button}
                        onPress={() => this.props.navigator.pop()}
                    >
                        <Text style={s.buttonText}>Disagree</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={0.5}
                        style={[s.button, s.buttonRight]}
                        onPress={() => { this.props.onAgree(); }}
                    >
                        <Text style={s.buttonText}>Agree</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    },
});


export function getAgreementRoute(props) {
    return {
        component: AgreementScreen,
        leftButtonIcon: backIcon,
        onLeftButtonPress: () => props.navigator.pop(),
        tintColor: '#FF1D70',
        passProps: props,
    };
}
