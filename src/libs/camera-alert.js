import { Alert } from 'react-native';
import ImagePicker from 'react-native-image-picker';


export default function cameraSourceAlert(launchFunction) {
    Alert.alert(
        'Upload image',
        'Choose image source',
        [
            { text: 'Cancel' },
            { text: 'Camera', onPress: () => launchFunction(ImagePicker.launchCamera) },
            { text: 'Gallery', onPress: () => launchFunction(ImagePicker.launchImageLibrary) },
        ]
    );
}
