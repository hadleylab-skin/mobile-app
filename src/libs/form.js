import _ from 'lodash';
import { Alert } from 'react-native';

export function handleFormSubmitError(error, formRef, fieldMap = _.identity) {
    const errorData = error.data;

    function showError(errors, fieldName) {
        const field = formRef.getInput(fieldMap(fieldName));
        if (field) {
            field.showError(_.join(errors, ','));
            return true;
        }
        return false;
    }

    if (!_.chain(errorData)
          .map(showError)
          .reduce((a, b) => a || b, false)
          .value()) {
        if (_.get(errorData, 'nonFieldErrors') && fieldMap('nonFieldErrors') === 'nonFieldErrors') {
            Alert.alert(
                'Submit error',
                _.join(errorData.nonFieldErrors, ','));
        } else {
            Alert.alert(
                'Server error',
                JSON.stringify(error));
        }
    }
}
