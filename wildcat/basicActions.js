/**
 * Created by nadav on 9/6/17.
 */

var wildcatUtils = require("./wildCatUtils.js");

var BASICACTIONS = module.exports = require("Node-Module.js")(module.url,{
    id: "BasicActions",
        name: "BasicActions",
    argsMap: {
        find: []
},
    find: function(fd){
        return [{}]
    },
    actionProps: {
        collectData: function(){
        }
    },
    instance:{
        actionUtils: {},
        getters: {}
    }
});
module.exports.registerComponent([
    {
    id: "basicActions",
    name: "basicActions",
    argsMap: {
        "click": ["target", "context", "props"],
        "type": ["target", "value", "context", "props"],
        "typeOnly": ["target", "value", "context", "props"],
        "clearContent": ["target", "context"],
        "getText": ["target","context","elem","props"],
        "getValue": ["target","context", "props"],
        "getAttrValue":["element","attributeName","context"],
        "setFocus": ["target", "context", "props"],
        "nativeType": ["value", "context", "props"],
        "swipeElement": ["target", "context", "props"],
        "installApp": ["app", "caps"],
        "launchApp": ["appName", "caps"],
        "switchToApp": ["appName"],
        "verifyByAttr": ["target", "attr", "value", "context", "props"],
        "verifyTextContent": ["target", "value", "context", "props"],
        "androidBack": [],
        "androidHome": [],
        "setFocusToCurrnetWindow": [],
        "setParentFocus" : [],
        "waitForElement": ["target", "timeout", "context"],
        "navigateTo": ["url"],
        "maximize_window": [],
        "toggleWiFi": [],
        "toggleAirplaneMode": [],
        "createSession": ["name"],
        "deleteSession":["name"],
        "hideKeyboard": []

    },
    instance: {
        actionUtils: {
            click: function (action) {
                cmd("click on " + action.args.target, function (a) {
                    a.findTarget(
                        function () {
                            return wildcatUtils.findElem(action.args.target, action.args.context);
                        },
                        function (elem) {
                            wildcatUtils.click(elem, a.end);
                        }
                    );
                });
            },
            type: function (action) {
                cmd("type '" + action.args.value + "' in '" + action.args.target + "'", function (a) {
                    a.findTarget(
                        function () {
                            return wildcatUtils.findElem(action.args.target, action.args.context);
                        },
                        function (elem) {
                            wildcatUtils.type(elem, action.args.value, function (endAction, str, Obj) {
                                action.verifyThat.false("failed to type '" + action.args.value + "'", Obj.value && Obj.value["message"]);
                                if (endAction) a.end();
                            });
                        }
                    );
                });
            },
            typeOnly: function (action) {
                cmd("typeOnly '" + action.args.value + "' in '" + action.args.target + "'", function (a) {
                    a.findTarget(
                        function () {
                            return wildcatUtils.findElem(action.args.target, action.args.context);
                        },
                        function (elem) {
                            wildcatUtils.typeOnly(elem, action.args.value, function (endAction, str, Obj) {
                                action.verifyThat.false("failed to type '" + action.args.value + "'", Obj.value && Obj.value["message"]);
                                if (endAction) a.end();
                            });
                        }
                    );
                });
            },
            clearContent: function (action) {
                cmd("clearContent in '" + action.args.target + "'", function (a) {
                    a.findTarget(
                        function () {
                            return wildcatUtils.findElem(action.args.target, action.args.context);
                        },
                        function (elem) {
                            wildcatUtils.clearContent(elem, a.end());
                            });
                        }
                    );
            },
            getText: function (action) {
                cmd("get text from '" + action.args.target +action.args.elem+ "'", function (a) {
                    if (action.args.elem) {
                        action.context = wildcatUtils.getText(action.args.elem, "textContent");
                        a.end();
                    } else {
                        a.findTarget(
                            function () {
                                return wildcatUtils.findElem(action.args.target, action.args.context);
                            },
                            function (elem) {
                                action.context = wildcatUtils.getText(elem, "textContent");
                                a.end();
                            }
                        );
                    }
                });
            },
            getValue: function (action) {
                cmd("get value from '" + action.args.target + "'", function (a) {
                    a.findTarget(
                        function () {
                            return wildcatUtils.findElem(action.args.target, action.args.context);
                        },
                        function (elem) {
                            action.context = wildcatUtils.getValue(elem, "textContent");
                            a.end();
                        }
                    );
                });
            },

            getAttrValue: function (action) {
                cmd("get attribute value for " + action.args.element + " element by "+action.args.attributeName+" attribute", function (a) {
                            action.context = wildcatUtils.getAttrValue(action.args.element, action.args.attributeName);
                            a.end();
                });
            },

            switchToApp: function (action) { //switch to already run app. name should be the context name , use GET contexts
                cmd("switch to app: '" + action.args.appName + "'", function (a) {
                    var isSet = wildcatUtils.setContext("WEBVIEW_" + action.args.appName);
                    if (!isSet) action.verifyThat.fatal("failed to switch app to '" + action.args.appName + "'")
                    a.end();
                });
            },
            setFocus: function (action) {
                cmd("set focus on ' " + action.args.target + "'", function (a) {
                    action.findTarget(
                        function () {
                            return wildcatUtils.findElem(action.args.target, action.args.context);
                        },
                        function (elem) {
                            wildcatUtils.TouchActions.tapElement(elem, a.end);
                        }
                    );
                });
            },
            nativeType: function (action) {
                cmd("native type '" + action.args.value + "'", function (a) {
                    for (let i = 0; i < action.args.value.length; i++) {
                        wildcatUtils.NativeActions.sendKeyboardEvent("KEYCODE_" + action.args.value[i], function (err) {
                            action.verifyThat.false("click on '" + action.args.value[i] + "'", err);
                        });
                    }
                    a.end();
                });
            },
            swipeElement: function (action) { //target : element where the swipe starts | xoffset,yoffset: pixels to swipe by | speed : pixel per sec (default = 400)
                cmd("swipe", function (a) {
                    a.findTarget(
                        function () {
                            return wildcatUtils.findElem(action.args.target, action.args.context);
                        },
                        function (elem) {
                            wildcatUtils.NativeActions.swipe({
                                elem: elem,
                                x: action.args.props.x,
                                y: action.args.props.y
                            }, function (endAction, str, Obj) {
                                action.verifyThat.false("swipe element", Obj.value && Obj.value["message"]);
                                a.end();
                            });
                        }
                    );
                });
            },
            installApp: function (action) {
                //app = app || wildcatUtils.getAppPath();
                cmd("install app: '" + action.args.app + "'", function (a) {
                    wildcatUtils.installApp(a.end, action.args.caps);
                });
            },
            launchApp: function (action) {
                cmd("launch app: '" + action.args.appName + "'", function (a) {
                    wildcatUtils.launchApp(action.args.caps, function () {
                        console.log("ok!")
                        a.end();
                    });
                    setTimeout(function () {
                        var isSet = wildcatUtils.setContext("NATIVE_APP");
                        if (!isSet) action.verifyThat.fatal("failed to switch app to '" + action.args.appName + "'");
                        a.end();

                    }, 3000)
                    // setTimeout(function () {
                    //     var isSet = wildcatUtils.setContext("WEBVIEW_" + action.args.appName);
                    //     if (!isSet) action.verifyThat.fatal("failed to switch app to '" + action.args.appName + "'");
                    //     a.end();
                    //
                    // }, 5000)
                });
            },
            switchToApp: function (action) { //switch to already run app. name should be the context name , use GET contexts
                cmd("switch to app: '" + action.args.appName + "'", function (a) {
                    var isSet = wildcatUtils.setContext("WEBVIEW_" + action.args.appName);
                    if (!isSet) action.verifyThat.fatal("failed to switch app to '" + action.args.appName + "'")
                    a.end();
                });

            },
            verifyByAttr: function (action) {
                cmd(`verify element '${action.args.target}' has attribute '${action.args.attr}' that equals to '${action.args.value}'`, function (a) {
                    this.props = action.args.props || {};
                    a.findTarget(
                        function () {
                            return wildcatUtils.findElem(action.args.target, action.args.context);
                        },
                        function (elem) {
                            if (this.props.verifyContains)
                                action.verifyThat.contains(
                                    `elem '${action.args.target}' value `,
                                    wildcatUtils.getAttrValue(elem, action.args.attr),
                                    action.args.value
                                );
                            else
                                action.verifyThat.equals(
                                    `elem '${action.args.target}' value `,
                                    action.args.value,
                                    wildcatUtils.getAttrValue(elem, action.args.attr)
                                );
                            a.end();
                        }
                    );
                });
            },
            verifyTextContent: function (action) {
                cmd(`verify element '${action.args.target}' has textContent that equals to  '${action.args.value}'`, function (a) {
                    this.props = action.args.props || {};
                    a.findTarget(
                        function () {
                            return wildcatUtils.findElem(action.args.target, action.args.context);
                        },
                        function (elem) {
                            if (this.props.verifyContains)
                                if (this.props.valueContains) {

                                    action.verifyThat.contains(
                                        `elem '${action.args.target}' text `,
                                        wildcatUtils.getText(elem, "textContent"),
                                        action.args.value
                                    );
                                } else {
                                    action.verifyThat.contains(
                                        `elem '${action.args.target}' text `,
                                        action.args.value,
                                        wildcatUtils.getText(elem, "textContent")
                                    );
                                }

                            else
                                action.verifyThat.equals(
                                    `elem '${action.args.target}' text `,
                                    action.args.value,
                                    wildcatUtils.getText(elem, "textContent")
                                );
                            a.end();
                        }
                    );
                });
            },
            androidBack: function (action) {
                cmd("Click on android back button", function (a) {
                    wildcatUtils.NativeActions.sendKeyboardEvent("KEYCODE_BACK", function (err) {
                        action.verifyThat.false("click on back button", err);
                        a.end();
                    });
                });
            },
            androidHome: function (action) {
                cmd("Click on android home button", function (a) {
                    wildcatUtils.NativeActions.sendKeyboardEvent("KEYCODE_HOME", function (err) {
                        action.verifyThat.false("click on home button", err);
                        a.end();
                    });
                });
            },
            setFocusToCurrnetWindow: function (action) {
                cmd("set Focus ToCurrnet Window", function (a) {
                    var isSet = wildcatUtils.setWindowFocus();
                    if (!isSet) action.verifyThat.fatal("set Focus ToCurrnet Window");
                    a.end();
                });

            },
            setParentFocus: function (action) {
                cmd("set Parent Focus ToCurrnet Window", function (a) {
                    var isSet = wildcatUtils.setParentFocus();
                    if (!isSet) action.verifyThat.fatal("set Focus ToCurrnet Window");
                    a.end();
                });

            },
            waitForElement: function (action) {
                cmd("wait For Element " + action.args.target, function (a) {
                    if (action.args.timeout) a.timeout = action.args.timeout;
                    a.findTarget(
                        function () {
                            return wildcatUtils.findElem(action.args.target, action.args.context);
                        },
                        function (elem) {
                            a.end();
                        }
                    );
                });
            },
            navigateTo: function (action) {
                cmd("navigate to '" + action.args.url + "'", function (a) {
                    wildcatUtils.setURL(action.args.url, function (endAction, str, Obj) {
                        if (Obj.value && Obj.value["message"]) action.verifyThat.fatal("failed to navigate : " + Obj.value["message"]);
                        a.end();
                    });
                });
                //basicActions.maximize_window()
            },
            maximize_window: function (action) {
                cmd("maximize_window...", function (a) {
                    wildcatUtils.maximize_window({}, function (endAction, str, Obj) {
                        if (Obj.value && Obj.value["message"]) action.verifyThat.fatal("failed to maximize_window : " + Obj.value["message"]);
                        a.end();
                    });
                });
            },
            toggleWiFi: function (action) {
                cmd("toggle WiFi", function (a) {
                    wildcatUtils.NativeActions.toggleWifi(function (endAction, str, Obj) {
                        if (Obj.value && Obj.value["message"]) action.verifyThat.fatal("failed to toggle WiFi : " + Obj.value["message"]);
                        a.end();
                    });
                });
            },
            toggleAirplaneMode: function (action) {
                cmd("toggle Airplane Mode", function (a) {
                    wildcatUtils.NativeActions.toggleAirplaneMode(function (endAction, str, Obj) {
                        if (Obj.value && Obj.value["message"]) action.verifyThat.fatal("failed to toggle Airplan eMode : " + Obj.value["message"]);
                        a.end();
                    });
                });
            },
            createSession: function (action) {
                cmd("create new session", function (a) {
                    var session = wildcatUtils.getSession(true);
                    var sessionsObj = getPref("wildcat_sessions");
                    if (!sessionsObj) sessionsObj = {};
                    sessionsObj[action.args.name] = session;
                    setPref("wildcat_sessions", sessionsObj);
                    wildcatUtils.useSession(action.args.name);
                    a.end();
                })
            },
            deleteSession: function (action) {
                cmd("delete session", function (a) {
                    wildcatUtils.useSession(action.args.name);
                    var session = wildcatUtils.getSession(false);

                    //delete session from config.json
                    var sessionsObj = getPref("wildcat_sessions");
                    delete sessionsObj[action.args.name];
                    setPref("wildcat_sessions", sessionsObj);

                    wildcatUtils.deleteSession(session, a.end);
                });
            },
            hideKeyboard: function (action) {
                cmd("hide keyboard", function (a) {
                    wildcatUtils.NativeActions.hideKeyboard(function (endAction, str, Obj) {
                        if (Obj && Obj.value && Obj.value["message"]) action.verifyThat.fatal("failed to hide Keyboard : " + Obj.value["message"]);
                        a.end();
                    });
                });
            },

        },
        getters: {}
    }
 }])
