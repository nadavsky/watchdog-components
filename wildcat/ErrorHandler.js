/**
 * Created by milkana on 16/07/15.
 */

    var errorsCodes = {
    '-1': {id: 'Unknown', message: 'Remote end send an unknown status code.'},
    '0': {id: 'Success', message: 'The command executed successfully.'},
    '6': {id: 'NoSuchDriver', message: 'A session is either terminated or not started'},
    '7': {id: 'NoSuchElement', message: 'An element could not be located on the page using the given search parameters.'},
    '8': {id: 'NoSuchFrame', message: 'A request to switch to a frame could not be satisfied because the frame could not be found.'},
    '9': {id: 'UnknownCommand', message: 'The requested resource could not be found, or a request was received using an HTTP method that is not supported by the mapped resource.'},
    '10': {id: 'StaleElementReference', message: 'An element command failed because the referenced element is no longer attached to the DOM.'},
    '11': {id: 'ElementNotVisible', message: 'An element command could not be completed because the element is not visible on the page.'},
    '12': {id: 'InvalidElementState', message: 'An element command could not be completed because the element is in an invalid state (e.g. attempting to click a disabled element).'},
    '13': {id: 'UnknownError', message: 'An unknown server-side error occurred while processing the command.'},
    '15': {id: 'ElementIsNotSelectable', message: 'An attempt was made to select an element that cannot be selected.'},
    '17': {id: 'JavaScriptError', message: 'An error occurred while executing user supplied JavaScript.'},
    '19': {id: 'XPathLookupError', message: 'An error occurred while searching for an element by XPath.'},
    '21': {id: 'Timeout', message: 'An operation did not complete before its timeout expired.'},
    '23': {id: 'NoSuchWindow', message: 'A request to switch to a different window could not be satisfied because the window could not be found.'},
    '24': {id: 'InvalidCookieDomain', message: 'An illegal attempt was made to set a cookie under a different domain than the current page.'},
    '25': {id: 'UnableToSetCookie', message: 'A request to set a cookie\'s value could not be satisfied.'},
    '26': {id: 'UnexpectedAlertOpen', message: 'A modal dialog was open, blocking this operation'},
    '27': {id: 'NoAlertOpenError', message: 'An attempt was made to operate on a modal dialog when one was not open.'},
    '28': {id: 'ScriptTimeout', message: 'A script did not complete before its timeout expired.'},
    '29': {id: 'InvalidElementCoordinates', message: 'The coordinates provided to an interactions operation are invalid.'},
    '30': {id: 'IMENotAvailable', message: 'IME was not available.'},
    '31': {id: 'IMEEngineActivationFailed', message: 'An IME engine could not be started.'},
    '32': {id: 'InvalidSelector', message: 'Argument was an invalid selector (e.g. XPath/CSS).'},
    '33': {id: 'SessionNotCreatedException', message: 'A new session could not be created.'},
    '34': {id: 'ElementNotScrollable', message: 'Element cannot be scrolled into view.'},

    // Other error
    '100': {id: 'UnknownEnviorement', message: 'The wanted env. is not defined'}
};


    var ErrorHandler = function(type, msg) {
        
        if (arguments.length === 2) {
            //message with type and msg
            this.type = type;
            this.message = this.type + " ";
            if(typeof type === 'number'){
                this.type = errorsCodes[errorsCodes[type] ? type : 13].id;
                this.message += errorsCodes[errorsCodes[type] ? type : 13].message + msg ? msg : "";
            }
            else this.message += msg;
        }
        else if (arguments.length === 1) {
            if(typeof type === 'number'){
                this.type = errorsCodes[errorsCodes[type] ? type : 13].id;
                this.message = errorsCodes[errorsCodes[type] ? type : 13].message + msg ? msg : "";
            }
            if(typeof type === 'string'){
                this.message = type;
            }
            else {
                this.message = "Kennel Web Driver ERROR";
            }
        }

        if(typeof this.message === 'object') {

            var seleniumMessage = this.message;
            if(seleniumMessage.message && seleniumMessage.type && seleniumMessage.status) {
                if(seleniumMessage.orgStatusMessage && seleniumMessage.orgStatusMessage.match(/"errorMessage":"NoSuchElement"/)) {
                    seleniumMessage.type = 'NoSuchElement';
                    seleniumMessage.status = 7;
                    seleniumMessage.message = errorsCodes['7'].message;
                }
                this.message = seleniumMessage.message  + ' (' + seleniumMessage.type + ':' + seleniumMessage.status + ')';
            }

            if(seleniumMessage.orgStatusMessage) {
                var reqPos = seleniumMessage.orgStatusMessage.indexOf(',"request"'), errorMsg;

                if(reqPos > 0) {
                    errorMsg = JSON.parse(seleniumMessage.orgStatusMessage.slice(0,reqPos) + '}').errorMessage;
                } else {
                    errorMsg = seleniumMessage.orgStatusMessage;
                }

                if(errorMsg.indexOf('No enum constant org.openqa.selenium.Platform') > -1) {
                    errorMsg = "The Selenium backend you've chosen doesn't support the desired platform (" + errorMsg.slice(46) + ')';
                }

                // truncate errorMessage
                if(errorMsg.indexOf('(Session info:') > -1) {
                    errorMsg = errorMsg.slice(0,errorMsg.indexOf('(Session info:')).replace(/\n/g,'').trim();
                }

                // make assumption based on experience on certain error messages
                if(errorMsg.indexOf('unknown error: path is not absolute') !== -1) {
                    errorMsg = 'You are trying to set a value to an input field with type="file", use the `uploadFile` command instead (Selenium error: ' + errorMsg + ')';
                }

                this.message = errorMsg;
            }
        }

        return (this.type || this.message) ? "ERROR : " +  (this.type ?  this.type : "") + " " + (this.message ? this.message : "") : null;
    };

module.exports = ErrorHandler;





