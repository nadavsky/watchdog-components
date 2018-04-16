/**
 * Created by nadav on 9/6/17.
 */
var wildcatUtils = require("./wildCatUtils.js");

var basicActions = {
    click: function(target, context, props) {
        cmd("click on " + target, function(action) {
            action.findTarget(
                function() {
                    return wildcatUtils.findElem(target, context);
                },
                function(elem) {
                    wildcatUtils.click(elem, action.end);
                }
            );
        });
    },

    type: function(target, value, context, props) {
        cmd("type '" + value + "' in '" + target + "'", function(action) {
            action.findTarget(
                function() {
                    return wildcatUtils.findElem(target, context);
                },
                function(elem) {
                    wildcatUtils.type(elem, value, function(endAction, str, Obj) {
                        action.verifyThat.false("failed to type '" + value + "'", Obj.value && Obj.value["message"]);
                        if (endAction) action.end();
                    });
                }
            );
        });
    },
    setFocus: function(target, context, props) {
        cmd("set focus on ' " + target + "'", function(action) {
            action.findTarget(
                function() {
                    return wildcatUtils.findElem(target, context);
                },
                function(elem) {
                    wildcatUtils.TouchActions.tapElement(elem, action.end);
                }
            );
        });
    },

    nativeType: function(value, context, props) {
        cmd("native type '" + value + "'", function(action) {
            for (let i = 0; i < value.length; i++) {
                wildcatUtils.NativeActions.sendKeyboardEvent("KEYCODE_" + value[i], function(err) {
                    action.verifyThat.false("click on '" + value[i] + "'", err);
                });
            }
            action.end();
        });
    },
    swipeElement: function(target, context, props) { //target : element where the swipe starts | xoffset,yoffset: pixels to swipe by | speed : pixel per sec (default = 400)
        cmd("swipe", function(action) {
            action.findTarget(
                function() {
                    return wildcatUtils.findElem(target, context);
                },
                function(elem) {
                    wildcatUtils.NativeActions.swipe({elem: elem, x: props.x, y: props.y}, function(endAction, str, Obj) {
                        action.verifyThat.false("swipe element" , Obj.value && Obj.value["message"]);
                        action.end();
                    });
                }
            );
        });
    },

    installApp: function(app, caps) {
        //app = app || wildcatUtils.getAppPath();
        cmd("install app: '" + app + "'", function(action) {
            wildcatUtils.installApp(action.end,caps);
        });
    },
    launchApp: function(appName, caps) {
        cmd("launch app: '" + appName + "'", function(action) {
            wildcatUtils.launchApp(caps, function(){
                console.log("ok!")
                action.end();
            });
            setTimeout(function(){
                var isSet = wildcatUtils.setContext("NATIVE_APP");
                if (!isSet) action.verifyThat.fatal("failed to switch app to '" + appName + "'" );
                action.end();

            },3000)
            setTimeout(function(){
                var isSet = wildcatUtils.setContext("WEBVIEW_" + appName);
                if (!isSet) action.verifyThat.fatal("failed to switch app to '" + appName + "'" );
                action.end();

            },5000)
        });
    },

    switchToApp: function(appName){ //switch to already run app. name should be the context name , use GET contexts
        cmd("switch to app: '" + appName + "'", function(action) {
            var isSet = wildcatUtils.setContext("WEBVIEW_" + appName);
            if (!isSet)action.verifyThat.fatal("failed to switch app to '" + appName + "'" )
            action.end();
        });

    },

    verifyByAttr: function(target, attr, value, context, props) {
        cmd(`verify element '${target}' has attribute '${attr}' that equals to '${value}'`, function(action) {
            props = props || {};
            action.findTarget(
                function() {
                    return wildcatUtils.findElem(target, context);
                },
                function(elem) {
                    if (props.verifyContains)
                        action.verifyThat.contains(
                            `elem '${target}' value `,
                            wildcatUtils.getAttrValue(elem, attr),
                            value
                        );
                    else
                        action.verifyThat.equals(
                            `elem '${target}' value `,
                            value,
                            wildcatUtils.getAttrValue(elem, attr)
                        );
                    action.end();
                }
            );
        });
    },
    verifyTextContent: function(target, value, context, props) {
        cmd(`verify element '${target}' has textContent that equals to  '${value}'`, function(action) {
            props = props || {};
            action.findTarget(
                function() {
                    return wildcatUtils.findElem(target, context);
                },
                function(elem) {
                    if (props.verifyContains)
                        if (props.valueContains) {

                            action.verifyThat.contains(
                                `elem '${target}' text `,
                                wildcatUtils.getText(elem, "textContent"),
                                value
                            );
                        } else {
                            action.verifyThat.contains(
                                `elem '${target}' text `,
                                value,
                                wildcatUtils.getText(elem, "textContent")
                            );
                        }

                    else
                        action.verifyThat.equals(
                            `elem '${target}' text `,
                            value,
                            wildcatUtils.getText(elem, "textContent")
                        );
                    action.end();
                }
            );
        });
    },

    androidBack: function() {
        cmd("Click on android back button", function(action) {
            wildcatUtils.NativeActions.sendKeyboardEvent("KEYCODE_BACK", function(err) {
                action.verifyThat.false("click on back button", err);
                action.end();
            });
        });
    },
    androidHome: function() {
        cmd("Click on android home button", function(action) {
            wildcatUtils.NativeActions.sendKeyboardEvent("KEYCODE_HOME", function(err) {
                action.verifyThat.false("click on home button", err);
                action.end();
            });
        });
    },
    setFocusToCurrnetWindow : function(){
        cmd("set Focus ToCurrnet Window", function(action) {
            var isSet = wildcatUtils.setWindowFocus();
            if( !isSet) action.verifyThat.fatal("set Focus ToCurrnet Window");
            action.end();
        });

    },
    waitForElement : function(target, timeout, context){
        cmd("wait For Element " + target, function(action) {
            if(timeout) action.timeout = timeout;
            action.findTarget(
                function() {
                    return wildcatUtils.findElem(target, context);
                },
                function(elem) {
                    action.end();
                }
            );
        });
    },

    navigateTo : function(url){
        cmd("navigate to '" + url+ "'", function(action) {
            wildcatUtils.setURL(url, function(endAction, str, Obj) {
                if( Obj.value && Obj.value["message"]) action.verifyThat.fatal("failed to navigate : " + Obj.value["message"]);
                action.end();
            });
        });


    },

    toggleWiFi : function(){
        cmd("toggle WiFi", function(action) {
            wildcatUtils.NativeActions.toggleWifi(function(endAction, str, Obj) {
                if( Obj.value && Obj.value["message"]) action.verifyThat.fatal("failed to toggle WiFi : " + Obj.value["message"]);
                action.end();
            });
        });
    },
    toggleAirplaneMode : function(){
        cmd("toggle Airplane Mode", function(action) {
            wildcatUtils.NativeActions.toggleAirplaneMode(function(endAction, str, Obj) {
                if( Obj.value && Obj.value["message"]) action.verifyThat.fatal("failed to toggle Airplan eMode : " + Obj.value["message"]);
                action.end();
            });
        });
    },
};

module.exports = basicActions;
