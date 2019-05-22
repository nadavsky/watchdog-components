/**
 * Created by nadav on 9/6/17.
 */
var wildcatUtils = require("./wildCatUtils.js");
var basicActions = module.exports = require("Node-Module.js")(module.url, {
    id: "basicActions",
    name: "basicActions",
    argsMap: {
        "click": ["target", "props"],
        "type": ["target", "value", "context", "props"],
        "getText": ["target","context", "props"],
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
        "waitForElement": ["target", "timeout", "context"],
        "navigateTo": ["url"],
        "maximize_window": [],
        "toggleWiFi": [],
        "toggleAirplaneMode": [],
        "createSession": ["name"],
        "deleteSession":["name"]

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
            getText: function (action) {
                cmd("get text from '" + action.args.target + "'", function (a) {
                    a.findTarget(
                        function () {
                            return wildcatUtils.findElem(action.args.target, action.args.context);
                        },
                        function (elem) {
                            action.context = wildcatUtils.getText(elem, "textContent");
                            a.end();
                        }
                    );
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
                    setTimeout(function () {
                        var isSet = wildcatUtils.setContext("WEBVIEW_" + action.args.appName);
                        if (!isSet) action.verifyThat.fatal("failed to switch app to '" + action.args.appName + "'");
                        a.end();

                    }, 5000)
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
                    props = action.args.props || {};
                    a.findTarget(
                        function () {
                            return wildcatUtils.findElem(action.args.target, action.args.context);
                        },
                        function (elem) {
                            if (props.verifyContains)
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
                    props = action.args.props || {};
                    a.findTarget(
                        function () {
                            return wildcatUtils.findElem(action.args.target, action.args.context);
                        },
                        function (elem) {
                            if (props.verifyContains)
                                if (props.valueContains) {

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
            waitForElement: function (action) {
                cmd("wait For Element " + action.args.target, function (a) {
                    if (action.args.timeout) a.timeout = timeout;
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
                    wildcatUtils.deleteSession(session, a.end);
                });
            }

        },
        getters: {}
    }
 })
// var basicActions = {
//     click: function(target, context, props) {
//         cmd("click on " + target, function(action) {
//             action.findTarget(
//                 function() {
//                     return wildcatUtils.findElem(target, context);
//                 },
//                 function(elem) {
//                     wildcatUtils.click(elem, action.end);
//                 }
//             );
//         });
//     },
//
//     type: function(target, value, context, props) {
//         cmd("type '" + value + "' in '" + target + "'", function(action) {
//              console.log("context: " + JSON.stringify(context));
//             action.findTarget(
//                 function() {
//                     return wildcatUtils.findElem(target, context);
//                 },
//                 function(elem) {
//                     wildcatUtils.type(elem, value, function(endAction, str, Obj) {
//                         action.verifyThat.false("failed to type '" + value + "'", Obj.value && Obj.value["message"]);
//                         if (endAction) action.end();
//                     });
//                 }
//             );
//         });
//     },
//     getText: function(target, context, props) {
//         var text = "";
//         cmd("get text from '" + target + "'", function (action) {
//             action.findTarget(
//                 function() {
//                     return wildcatUtils.findElem(target, context);
//                 },
//                 function (elem) {
//                     action.end();
//                     return wildcatUtils.getText(elem, "textContent");
//                 }
//             );
//         });
//     },
//     setFocus: function(target, context, props) {
//         cmd("set focus on ' " + target + "'", function(action) {
//             action.findTarget(
//                 function() {
//                     return wildcatUtils.findElem(target, context);
//                 },
//                 function(elem) {
//                     wildcatUtils.TouchActions.tapElement(elem, action.end);
//                 }
//             );
//         });
//     },
//
//     nativeType: function(value, context, props) {
//         cmd("native type '" + value + "'", function(action) {
//             for (let i = 0; i < value.length; i++) {
//                 wildcatUtils.NativeActions.sendKeyboardEvent("KEYCODE_" + value[i], function(err) {
//                     action.verifyThat.false("click on '" + value[i] + "'", err);
//                 });
//             }
//             action.end();
//         });
//     },
//     swipeElement: function(target, context, props) { //target : element where the swipe starts | xoffset,yoffset: pixels to swipe by | speed : pixel per sec (default = 400)
//         cmd("swipe", function(action) {
//             action.findTarget(
//                 function() {
//                     return wildcatUtils.findElem(target, context);
//                 },
//                 function(elem) {
//                     wildcatUtils.NativeActions.swipe({elem: elem, x: props.x, y: props.y}, function(endAction, str, Obj) {
//                         action.verifyThat.false("swipe element" , Obj.value && Obj.value["message"]);
//                         action.end();
//                     });
//                 }
//             );
//         });
//     },
//
//     installApp: function(app, caps) {
//         //app = app || wildcatUtils.getAppPath();
//         cmd("install app: '" + app + "'", function(action) {
//             wildcatUtils.installApp(action.end,caps);
//         });
//     },
//     launchApp: function(appName, caps) {
//         cmd("launch app: '" + appName + "'", function(action) {
//             wildcatUtils.launchApp(caps, function(){
//                 console.log("ok!")
//                 action.end();
//             });
//             setTimeout(function(){
//                 var isSet = wildcatUtils.setContext("NATIVE_APP");
//                 if (!isSet) action.verifyThat.fatal("failed to switch app to '" + appName + "'" );
//                 action.end();
//
//             },3000)
//             setTimeout(function(){
//                 var isSet = wildcatUtils.setContext("WEBVIEW_" + appName);
//                 if (!isSet) action.verifyThat.fatal("failed to switch app to '" + appName + "'" );
//                 action.end();
//
//             },5000)
//         });
//     },
//
//     switchToApp: function(appName){ //switch to already run app. name should be the context name , use GET contexts
//         cmd("switch to app: '" + appName + "'", function(action) {
//             var isSet = wildcatUtils.setContext("WEBVIEW_" + appName);
//             if (!isSet)action.verifyThat.fatal("failed to switch app to '" + appName + "'" )
//             action.end();
//         });
//
//     },
//
//     verifyByAttr: function(target, attr, value, context, props) {
//         cmd(`verify element '${target}' has attribute '${attr}' that equals to '${value}'`, function(action) {
//             props = props || {};
//             action.findTarget(
//                 function() {
//                     return wildcatUtils.findElem(target, context);
//                 },
//                 function(elem) {
//                     if (props.verifyContains)
//                         action.verifyThat.contains(
//                             `elem '${target}' value `,
//                             wildcatUtils.getAttrValue(elem, attr),
//                             value
//                         );
//                     else
//                         action.verifyThat.equals(
//                             `elem '${target}' value `,
//                             value,
//                             wildcatUtils.getAttrValue(elem, attr)
//                         );
//                     action.end();
//                 }
//             );
//         });
//     },
//     verifyTextContent: function(target, value, context, props) {
//         cmd(`verify element '${target}' has textContent that equals to  '${value}'`, function(action) {
//             props = props || {};
//             action.findTarget(
//                 function() {
//                     return wildcatUtils.findElem(target, context);
//                 },
//                 function(elem) {
//                     if (props.verifyContains)
//                         if (props.valueContains) {
//
//                             action.verifyThat.contains(
//                                 `elem '${target}' text `,
//                                 wildcatUtils.getText(elem, "textContent"),
//                                 value
//                             );
//                         } else {
//                             action.verifyThat.contains(
//                                 `elem '${target}' text `,
//                                 value,
//                                 wildcatUtils.getText(elem, "textContent")
//                             );
//                         }
//
//                     else
//                         action.verifyThat.equals(
//                             `elem '${target}' text `,
//                             value,
//                             wildcatUtils.getText(elem, "textContent")
//                         );
//                     action.end();
//                 }
//             );
//         });
//     },
//
//     androidBack: function() {
//         cmd("Click on android back button", function(action) {
//             wildcatUtils.NativeActions.sendKeyboardEvent("KEYCODE_BACK", function(err) {
//                 action.verifyThat.false("click on back button", err);
//                 action.end();
//             });
//         });
//     },
//     androidHome: function() {
//         cmd("Click on android home button", function(action) {
//             wildcatUtils.NativeActions.sendKeyboardEvent("KEYCODE_HOME", function(err) {
//                 action.verifyThat.false("click on home button", err);
//                 action.end();
//             });
//         });
//     },
//     setFocusToCurrnetWindow : function(){
//         cmd("set Focus ToCurrnet Window", function(action) {
//             var isSet = wildcatUtils.setWindowFocus();
//             if( !isSet) action.verifyThat.fatal("set Focus ToCurrnet Window");
//             action.end();
//         });
//
//     },
//     waitForElement : function(target, timeout, context){
//         cmd("wait For Element " + target, function(action) {
//             if(timeout) action.timeout = timeout;
//             action.findTarget(
//                 function() {
//                     return wildcatUtils.findElem(target, context);
//                 },
//                 function(elem) {
//                     action.end();
//                 }
//             );
//         });
//     },
//
//     navigateTo : function(url){
//         cmd("navigate to '" + url+ "'", function(action) {
//             wildcatUtils.setURL(url, function(endAction, str, Obj) {
//                 if( Obj.value && Obj.value["message"]) action.verifyThat.fatal("failed to navigate : " + Obj.value["message"]);
//                 action.end();
//             });
//         });
//         //basicActions.maximize_window()
//     },
//     maximize_window : function(){
//         cmd("maximize_window...", function(action) {
//             wildcatUtils.maximize_window( {},function(endAction, str, Obj) {
//                 if( Obj.value && Obj.value["message"]) action.verifyThat.fatal("failed to maximize_window : " + Obj.value["message"]);
//                 action.end();
//             });
//         });
//     },
//
//     toggleWiFi : function(){
//         cmd("toggle WiFi", function(action) {
//             wildcatUtils.NativeActions.toggleWifi(function(endAction, str, Obj) {
//                 if( Obj.value && Obj.value["message"]) action.verifyThat.fatal("failed to toggle WiFi : " + Obj.value["message"]);
//                 action.end();
//             });
//         });
//     },
//     toggleAirplaneMode : function(){
//         cmd("toggle Airplane Mode", function(action) {
//             wildcatUtils.NativeActions.toggleAirplaneMode(function(endAction, str, Obj) {
//                 if( Obj.value && Obj.value["message"]) action.verifyThat.fatal("failed to toggle Airplan eMode : " + Obj.value["message"]);
//                 action.end();
//             });
//         });
//     },
//
//     createSession: function (name) {
//         cmd("create new session", function(action){
//             var session= wildcatUtils.getSession(true);
//             var sessionsObj = getPref("wildcat_sessions");
//             if (!sessionsObj) sessionsObj={};
//             sessionsObj[name]= session;
//             setPref("wildcat_sessions", sessionsObj);
//             wildcatUtils.useSession(name);
//             action.end();
//         })
//     }
//
//
// };
//
// module.exports = basicActions;
