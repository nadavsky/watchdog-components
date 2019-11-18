/**
 * Created by milkana on 19/07/15.
 */
var utils          = require("./WildCatManager.js"),
    callb          = require("./Callbacks.js"),
    Log            = require("./CustomLogger.js"),
    ErrorHandler   = require("./ErrorHandler.js"),
    ElemStrategies = require("./ElemStrategies.js"),
    unicodeChars   = require("./Codes/JsonWireUnicodeChars.js"),
    androidCodes   = require("./Codes/AndroidKeyCodes.js"),
    iOSKeyCodes    = require("./Codes/iOSKeyCodes.js");


const FIND_OBJECT_TIMEOUT = 10000;
var tryToconnectSecondTime = 0;
var isWasSetFrame = false;
var prevSetFrame, lastSetFrame;
var sroteView = {
    "view" : "WEBVIEW_5",
    "url"  : "none"
};
var zappView = {
    "view" : "WEBVIEW_1",
    "url"  : "none"
};;

var commands = {

    verifyElemMethods : {
        "getText"         : "getText",
        "getValue"        : "getValue",
        "isElemDisplayed" : "isElemDisplayed",
        "elemSize"        : "elemSize",
        "cssProperty"     : "cssProperty",
        "location"        : "location",
        "attrValue"       : "attrValue"
    },

    init :function (server, platform) {
       // var session = utils.init();
        var session = utils.init(server, platform);
    },

    TouchActions : {

        tapElement: function(elem,cb){
            var session = commands.getSession();
            utils.sendRequest('POST','/session/' + session + '/touch/click', callb.basic(cb), JSON.stringify({"element":elem}));
            },

        swipeElement : function(cb,data){
	        data.element = utils.getElemId();

            function sendSwipe(){
                utils.sendRequest({
                    method: 'POST',
                    relPath: '/session/:sessionId/touch/flick',
                    cb: callb.basic(cb),
                    data: JSON.stringify(data)
                })
            }
	        sendSwipe();
        }

    },

    NativeActions : {
        toggleWifi: function(cb){
            var session = commands.getSession();
            utils.sendRequest('POST','/session/' + session + '/appium/device/toggle_wifi',  function(non,resString,respObj){cb(non,resString,respObj)});
        },

        toggleLocationService: function(cb){utils.sendRequest('POST','/session/:sessionId/appium/device/toggle_location_services', callb.basic(cb));},

        openNotifications: function(cb){utils.sendRequest('POST','/session/:sessionId/appium/device/open_notifications', callb.basic(cb));},

        toggleAirplaneMode: function(cb){
            var session = commands.getSession();
            utils.sendRequest('POST','/session/' + session + '/appium/device/toggle_airplane_mode', function(non,resString,respObj){cb(non,resString,respObj)});
        },

        toggleData: function(cb){
            var session = commands.getSession();
            utils.sendRequest('POST','/session/' + session + '/appium/device/toggle_data', function(non,resString,respObj){cb(non,resString,respObj)});
        },

        hideKeyboard: function(cb){utils.sendRequest('POST','/session/:sessionId/appium/device/hide_keyboard', callb.basic(cb));},

        pullFile: function(cb,data){utils.sendRequest('POST','/session/:sessionId/appium/device/pull_file', callb.withData(cb),{path: data});},

        pushFile: function(cb,data){utils.sendRequest('POST','/session/:sessionId/appium/device/push_file', callb.withData(cb),{ path: data.pathOnTheDevice, data: data.base64Data });},

        sendKeyboardEvent: function(keyCode, cb){
            var session = commands.getSession();
            var currentKeyCode = utils.isAndroidRunningNow() === true ? androidCodes[keyCode] : iOSKeyCodes[keyCode];
            var key =  JSON.stringify({ keycode : currentKeyCode});
            utils.sendRequest({
                method: 'POST',
                relPath: '/session/' + session + '/appium/device/press_keycode',
                cb: callb.withData(cb),
                data: key
            });
        },

        getCurrentPackage: function(cb){
            var session = commands.getSession(),current_package;
            utils.sendRequest('GET','/session/' + session + '/appium/device/current_package', callb.withData(function(err,obj){
                if(!err && obj["value"]){
                    current_package = obj["value"];
                }
            }))
            return current_package;
        },

        isAppInstalled: function(cb,data){utils.sendRequest('POST','/session/:sessionId/appium/device/app_installed', callb.withData(cb),{bundleId: utils.getBundleId()});},

        swipe: function(data,cb){
            var session = commands.getSession();
            data.speed = data.speed || 400;
            utils.sendRequest({
                method: 'POST',
                relPath: '/session/' + session + '/touch/flick',
                cb: function(non,resString,respObj){cb(non,resString,respObj)},
                data: JSON.stringify({element: data.elem, xoffset: data.x, yoffset: data.y, speed: data.speed})

            });
        },

        installTheApp: function(cb,data){utils.sendRequest('POST','/session/:sessionId/appium/device/install_app', callb.withData(cb),{bundleId: utils.getAppPath()});},

        removeTheApp: function(cb,data){utils.sendRequest('POST','/session/:sessionId/appium/device/remove_app', callb.withData(cb),{bundleId: utils.getAppPath()});}

    },

    App : {
        close: function(cb){utils.sendRequest('POST','/session/:sessionId/appium/app/close', callb.basic(cb));}
    },

    isRunningIOS : function(){
        return utils.isRunningIOSNow();
    },

    prepareToWorkInStore : function(cb){
        if(!utils.isAndroidRunningNow()) {
            commands.setContexts(sroteView.view, function (err, value) {
                isWasSetFrame = true;
                cb(err, value);
            });
        }
    },

    setLastContext : function(cb){
        if(!utils.isAndroidRunningNow()) {
            commands.setContexts(prevSetFrame, function (err, value) {
                cb(err, value);
            });
        }
    },

    prepareToWorkInNative : function(){
        if(!utils.isAndroidRunningNow()) {
            commands.setContexts("NATIVE_APP", function (err, value) {
                isWasSetFrame = false;
                cb(err, value);
            });
        }
    },

    prepareToWorkInZapp : function(cb){
        if(utils.isAndroidRunningNow() || utils.isRunningChromeNow()){
            //we need to set iframe
            commands.frame('zapp-frame', function(err, value){
                isWasSetFrame = true;
                cb(err, value);
            })
        }
        else {
            commands.setContexts(zappView.view, function(err,value){
                isWasSetFrame = true;
                cb(err, value);
            });
        }
    },

    getURL: function(cb){utils.sendRequest('GET','/session/:sessionId/url', callb.withData(cb));},

    setURL: function(data, cb){
        var session = commands.getSession();
        utils.sendRequest({
            method: 'POST',
            relPath: '/session/' + session + '/url',
            cb: function(non,resString,respObj){cb(non,resString,respObj)},
            data: JSON.stringify({url: data})
        });
    },
    maximize_window: function(data, cb){
        var session = commands.getSession();
        var window_handle = commands.getLastOpenedWindowId()
        utils.sendRequest({
            method: 'POST',
            relPath: '/session/' + session + '/window/' + window_handle + '/maximize',
            cb: function(non,resString,respObj){cb(non,resString,respObj)},
            data: JSON.stringify({url: data})
        });
    },



    // <editor-fold desc="Session">
    status: function(cb){utils.sendRequest('GET','/status', callb.basic(cb),true);},


    //posts to session
    installApp : function(cb, caps) {
        utils.init();
        utils.sendRequest('POST','/session',  callb.withData(cb,this),JSON.stringify(caps || utils.getCurrentCaps(true)));
    },

    launchApp : function(caps, cb) {
        //utils.init();
        var session = commands.getSession();
        utils.sendRequest('POST','/session/' + session + '/appium/device/start_activity',  callb.withData(cb,this), JSON.stringify(caps));
    },

    acceptAlert: function(cb){utils.sendRequest('POST','/session/:sessionId/accept_alert', callb.basic(cb));},

    //delete session

    deleteSession: function(session, cb){
      /*  commands.setStoreView(()=>{
            commands.execute("$user && $user.logout();",null,"both",function(err,value){
                if(utils.isUsingCrossWalk()) {
                    utils.usingCrossWalk(true);
                    utils.sendRequest('DELETE', '/session/:sessionId', callb.basic(cb));
                }
                utils.usingCrossWalk(false);
                utils.sendRequest('DELETE', '/session/:sessionId', callb.basic(cb));
            });
        });*/
      if(utils.isUsingCrossWalk()) {
            utils.usingCrossWalk(true);
            utils.sendRequest('DELETE', '/session/' + session, callb.basic(cb));
        }
        utils.usingCrossWalk(false);
        utils.sendRequest('DELETE', '/session/' + session, callb.basic(cb));
    },

    sessions: function(cb){utils.sendRequest('GET','/sessions', callb.withData(cb));},

    getLastOpenedWindowId : function(){
        var window_handle;
        var session = commands.getSession();
        utils.sendRequest('GET','/session/' + session + '/window_handles',  callb.withData(function(err,obj){
            if(!err){
                if (typeof obj.value == "object")
                    window_handle= obj.value.slice(-1)[0];
                else
                    window_handle= obj.value;
            }
        }));
        return window_handle;
    },

    setWindowFocus : function(session){
        var failed;
        var session = session || commands.getSession();
        var getCurrentWindowId = JSON.stringify({"name" : commands.getLastOpenedWindowId()});
        utils.sendRequest({
            method: 'POST',
            relPath: '/session/' + session + '/window',
            cb: function(non,resString,respObj){ var failed = respObj.value && respObj.value["message"]},
            data: getCurrentWindowId
        });
        return !failed;
    },
    setParentFocus : function(session){
        var failed;
        var session = session || commands.getSession();
        var getCurrentWindowId = JSON.stringify({"name" : commands.getLastOpenedWindowId()});
        utils.sendRequest({
            method: 'POST',
            relPath: '/session/' + session + '/frame/parent',
            cb: function(non,resString,respObj){ var failed = respObj.value && respObj.value["message"]},
            data: getCurrentWindowId
        });
        return !failed;
    },


    getSession : function(createNewSession){
        Logger.debug("on get session................")
       // Log.print("on get session................")

        //var currentConfig = utils.init();
        /*utils.sendRequest('GET','/sessions',  callb.withData(function(err,obj){
            if(!err){
                session= obj.value[0] && obj.value[0].id;
            }
        },this));*/
        if (!createNewSession){
            var session = getPref("wildcat_current_session");
            return session;
        }
        else{
            utils.sendRequest('POST','/session',  callb.withData(function(err,obj){
                //console.log("after POST request in get session");
                Logger.debug("after POST request in get session");
                if(!err && obj["sessionId"]){
                    session = obj["sessionId"];
                    utils.setSessionId(session);
                }
                else  {
                    Logger.error("getSession: failed to get session")
                }
            },this),JSON.stringify(utils.getCurrentCaps(false)));
            return session;
        }

    },
    useSession: function(name){
        var session = getPref("wildcat_sessions")[name];
       Logger.debug("use session : " + session)
       //console.log("use session : " + session)
        setPref("wildcat_current_session", session);
        return session;

    },

    //returns true is there is open session otherwise false
    isConnected(){
        var isConnect;
        console.log("isConnected() : check if connected")
        utils.sendRequest('GET','/sessions',  callb.withData(function(err,obj){
            console.log("after request in get session");
            if(!err){
                isConnect= obj.value[0] && obj.value[0].id;
            }
        },this));
        console.log("isConnected() : " + isConnect)
        return  isConnect;
    },

    getStoreUrl(){
        return sroteView.url;
    },

    setStoreView(cb){
        commands.setContexts(sroteView.view, cb);
    },


    // </editor-fold>

    //the condition can be iOS or android
    execute :function(script,args,condition,cb){
        var dataTosend = JSON.stringify({
            script: script,
            args:  args || []
        });

         if(!(condition && ((condition === "both") || (condition === "android" && utils.isAndroidRunningNow())  || (condition === "iOS" && utils.isRunningIOSNow())))){
             return cb(null, null)
         }

         utils.sendRequest({
             method: 'POST',
             relPath: '/session/:sessionId/execute',
             cb: callb.withData(function(err, value){
                 if(typeof cb === 'function')
                     cb(err,value);
             }, this),
             data: dataTosend
         });
     },

    executeAsync :function(script,args,condition,cb){
        if(!(condition && ((condition === "android" && utils.isAndroidRunningNow())  || (condition === "iOS" && utils.isRunningIOSNow())))){
            return cb(null, null)
        }
        var dataTosend = JSON.stringify({
            script: script,
            args: args || []
        });
        utils.sendRequest({
            method: 'POST',
            relPath: '/session/:sessionId/execute_async',
            cb: callb.withData(function(err, value){
                cb(value);
            }, this),
            data: dataTosend
        });
    },


   // <editor-fold desc="Element">


    //find element single try
    //elem selector should be in one of the following formats:
        // xpath:*, id:*, css:*, tagName:*, className: *
    findElem : function(elemSelector,context,session) {
        var data = JSON.stringify(ElemStrategies(elemSelector));
        var session = this.getSession();
        var element;
        if(context){
            utils.sendRequest({
                method: 'POST',
                relPath: '/session/' + session +'/element/' + context + '/elements',
                cb: callb.withData(function(err, obj){
                    Logger.debug(err);
                    //Log.print(err);
                    if(err) commands.tryToRecconnect(err);
                    if(obj && obj.value && obj.value.length){
                        element=obj.value[0]["ELEMENT"];
                        //cb(null,value.value["ELEMENT"]);
                    }
                    //else cb(err,null);
                }, this),
                data: data
            });

        }
        else{
            utils.sendRequest({
                method: 'POST',
                relPath: '/session/' + session +'/element',
                cb: callb.withData(function(err, value){
                    Logger.debug(err);
                    //Log.print(err);
                    if(err) commands.tryToRecconnect(err);
                    if(value && value.value && value.value && value.hasOwnProperty("value")){
                        element=value.value["ELEMENT"];
                        //cb(null,value.value["ELEMENT"]);
                    }
                    //else cb(err,null);
                }, this),
                data: data
            });
        }
       Logger.debug("in find elem, element = "+ element)
       //console.log("in find elem, element = "+ element)

        return element ? [element] : [];
   },

    /*findElem : function(elemSelector,cb) {
        var data = JSON.stringify(ElemStrategies(elemSelector));
        utils.sendRequest({
            method: 'POST',
            relPath: '/session/:sessionId/element',
            cb: callb.withData(function(err, value){
                Log.print(err);
                if(err) commands.tryToRecconnect(err);
                if(value && value.value && value.value && value.hasOwnProperty("value")){
                    utils.setElemId(value.value["ELEMENT"]);
                    cb(null,value.value["ELEMENT"]);
                }
                else cb(err,null);
            }, this),
            data: data
        });
    },*/

    setFrame: function(frameIdentifier){
        var failed;
        var session  = commands.getSession();
        utils.sendRequest('POST','/session/' + session + '/frame', callb.withData(function(err, obj){
            var failed = obj.value && obj.value["message"]
        }),
        JSON.stringify(frameIdentifier));
        return !failed
    },

    findElems : function(elemSelector,cb){
        var data = JSON.stringify(ElemStrategies(elemSelector));
        var session = this.getSession();
        var elements
        utils.sendRequest({
            method: 'POST',
            relPath: '/session/'+session+'/elements',
            cb: callb.withData(function(err, value){
                if(value && value.hasOwnProperty("value")){
                   //utils.setElemId(value.value["ELEMENT"]);
                    elements=value.value
                    //cb(null,value.value["ELEMENT"]);
                }
                else
                {
                    //cb(err,null);
                }

            }, this),
            data: data
        });
        console.log("in find elems, elements = "+ JSON.stringify(elements))
        return elements ? [elements] : [];
    },

    tryToRecconnect : function(err){
        if((err.includes("26") || err.includes("6")) && tryToconnectSecondTime < 5 && utils.isUsingCrossWalk()){
            commands.session(function (err, value){
                var sessionId = value ? value["sessionId"] : null;
                if (sessionId) utils.setSessionId(sessionId);
                tryToconnectSecondTime++;
                var prev = new Date().getTime();
                Log.print(`Connect to crossWalk for ${tryToconnectSecondTime} Time`);
                while(new Date().getTime() - prev < (15000 * tryToconnectSecondTime)){}
                Log.print("after sleep " + (prev - new Date().getTime()));
            });
        }
    },

   findElemetIntoOtherElem : function(elemSelectorOuter,elemSelector,cb){
         commands.findElem(elemSelectorOuter,function(){
             var data = JSON.stringify(ElemStrategies(elemSelector));
             utils.sendRequest({
                 method: 'POST',
                 relPath: '/session/:sessionId/element/:id/element',
                 cb: callb.withData(function(err, value){
                     utils.setElemId(value["ELEMENT"]);
                     cb(err,value["ELEMENT"]);
                 }, this),
                 data: data
             });
         })
    },

   click: function(elem, cb, props={}){
        var session= this.getSession();
        if (props.x && props.y){
            utils.sendRequest('POST','/session/' + session + '/click', callb.basic(cb))
        }
        else{
            utils.sendRequest('POST','/session/' + session + '/element/' + elem + '/click', callb.basic(cb))
        }

    },

   type :function(elem, value,cb,elemId){
       function checkUnicode(value) {
           return unicodeChars.hasOwnProperty(value) ? [unicodeChars[value]] : value.split('');
       }

       if(elemId) utils.setElemId(elemId);
       var key = checkUnicode(value);
       var objValue = JSON.stringify({"value" : key});
       var session = this.getSession();
       utils.sendRequest({
           method: 'POST',
           relPath: '/session/' + session + '/element/'+elem+'/clear',
           cb: function(non,resString,respObj){cb(non,resString,respObj)}
       });
       utils.sendRequest({
           method: 'POST',
           relPath: '/session/' + session + '/element/'+elem+'/value',
           cb: function(non,resString,respObj){cb(true,resString,respObj)},
           data: objValue
       });
   },
    typeOnly :function(elem, value, cb, elemId){
        function checkUnicode(value) {
            return unicodeChars.hasOwnProperty(value) ? [unicodeChars[value]] : value.split('');
        }

        if(elemId) utils.setElemId(elemId);
        var key = checkUnicode(value);
        var objValue = JSON.stringify({"value" : key});
        var session = this.getSession();
        utils.sendRequest({
            method: 'POST',
            relPath: '/session/' + session + '/element/'+elem+'/value',
            cb: function(non,resString,respObj){cb(true,resString,respObj)},
            data: objValue
        });
    },

   clearContent: function(elem, cb){utils.sendRequest('POST','/session/:sessionId/element/'+elem+'/clear', callb.basic(cb));},

   contexts : function(cb){
       var session = this.getSession();
       console.log(" in 'contexts' session= " + session);
       utils.sendRequest({
           method: 'GET',
           relPath: '/session/' + session + '/contexts',
           cb: callb.withData(function(err, value){
                 //cb(err,value)
           }, this)
       });
   },

    setContext : function(data,cb){
        var currData = JSON.stringify({name:data});
        var session = this.getSession(),isSet;
        utils.sendRequest({
            method: 'POST',
            relPath: '/session/' + session + '/context',
            cb: callb.withData(function(err, obj){
                if(lastSetFrame) prevSetFrame =lastSetFrame;
                lastSetFrame = data;
                isSet=obj && obj.status == 0;
                console.log("setContext --> isSet = " + isSet)
                //cb(err,value)
            }, this),
            data:currData
        });
        return isSet;
    },

   findTimeout : function(cb,ms){
       var data = {ms :ms || FIND_OBJECT_TIMEOUT };
       var objValue = JSON.stringify(data);
       utils.sendRequest({
           method: 'POST',
           relPath: '/session/:sessionId/timeouts/implicit_wait',
           cb: callb.basic(cb, this),
           data: objValue
       });
   },

   // <editor-fold desc="Portocol functions - Validations">
    isElemDisplayed : function(propertyName,cb){
            if(!cb) cb = propertyName;
            utils.sendRequest({
                method: 'GET',
                relPath: '/session/:sessionId/element/:id/displayed',
                cb: callb.withData(function(err, value){
                    cb(err,value && value.value)
                }, this)
            });
        },

    elemSize : function(propertyName,cb){
            if(!cb) cb = propertyName;
            utils.sendRequest({
                method: 'GET',
                relPath: '/session/:sessionId/element/:id/size',
                cb: callb.withData(function(err, value){
                    cb(err, value && value.value)
                }, this)
            });
        },

    cssProperty : function(propertyName,cb){
            utils.sendRequest({
                method: 'GET',
                relPath: '/session/:sessionId/element/:id/css/' + propertyName,
                cb: callb.withData(function(err, value){
                    cb(err,value);
                }, this)
            });
        },

    location : function(cb){
            utils.sendRequest({
                method: 'GET',
                relPath: '/session/:sessionId/element/:id/location',
                cb: callb.withData(function(err, response){
                    cb(err, response.value);
                }, this)
            });
        },

    getText : function(elem){
        var session = this.getSession(),
        value= "";
        utils.sendRequest({
            method: 'GET',
            relPath: '/session/' + session + '/element/' + elem + '/text',
            cb: callb.withData(function(err, obj){
                value=obj["value"];
               }, this)
        });
        return value;
    },
    getValue : function(elem){
        var session = this.getSession(),
            value= "";
        utils.sendRequest({
            method: 'GET',
            relPath: '/session/' + session + '/element/' + elem + '/value',
            cb: callb.withData(function(err, obj){
                value=obj["value"];
            }, this)
        });
        return value;
    },
    getAttrValue : function(target, attr){
        var session = this.getSession(),
            value= "";
        utils.sendRequest({
            method: 'GET',
            relPath: '/session/' + session + '/element/' + target + '/attribute/' + attr,
            cb: callb.withData(function(err, obj){
                value=obj["value"];
            }, this)
        });
        return value;
    },


   //</editor-fold>

   //</editor-fold>

   tapOnElement : function(cb){
       function getMobileData(){
           return {
               screen : screen,
               window : {
                   scrollX : window.scrollX,
                   scrollY : window.scrollY,
                   zoom    : window.zoom,
                   outerHeight : window.outerHeight,
                   outerWidth  : window.outerWidth,
                   innerHeight : window.innerHeight,
                   innerWidth  : window.innerWidth
               },
               device : {
                   devicePixelRatio :devicePixelRatio
               }
           }
       }

       //var deviceWidth = (Math.abs(window.orientation) == 90) ? screen.height : screen.width;var zoom = deviceWidth / window.innerWidth;return {zoom: zoom,devicePxPerCssPx: zoom * devicePixelRatio}
       commands.execute(getMobileData.toString() + "; return getMobileData();",null, "both",function(err,retValue){
           var zoom = retValue.value.device.devicePixelRatio;
           console.log("Zooom ---> " + zoom);
           commands.location(function(err, value){
               var x_pos = value.x;
               var y_pos = value.y;
               console.log("x_pos x ---> " + x_pos);
               console.log("y_pos y ---> " + y_pos);
               commands.elemSize(function(err,value){
                   x_pos += value.width/2;
                   y_pos += value.height/2*zoom;
                   console.log("x_pos width ---> " + x_pos);
                   console.log("y_pos height ---> " + y_pos);
                   commands.execute("mobile: tap",[{"x": Math.floor(x_pos), "y" :Math.floor(y_pos)}],"both",function(err,value){
                       cb(err);
                   });
               });
           });
       });
   },

   screenshot: function(cb) {
       var session= utils.getSessionId();
       var value;
       //utils.sendRequest('GET', '/session/' + session + '/screenshot', callb.withData(cb),{})
       utils.sendRequest({
           method: 'GET',
               relPath: '/session/' + session + '/screenshot',
               cb: callb.withData(function(err, obj){
                   value=obj["value"];
               }, this)
       });
       return value;

   },

    set_window_size: function(width,height,data, cb){
        var session = commands.getSession();
        var window_handle = commands.getLastOpenedWindowId()
        utils.sendRequest({
            method: 'POST',
            relPath: '/session/' + session + '/window/' + window_handle + '/size',
            cb: function(non,resString,respObj){cb(non,resString,respObj)},
            data: JSON.stringify({width:width,height:height})
        });
    },

};

function replaceObjProps(obj,replacedPros) {
        Object.keys(replacedPros).forEach((item)=>{
            if(obj.hasOwnProperty(item)) obj[item]=replacedPros[item]
        })

    Object.keys(obj).forEach((item)=>{
        if(typeof obj[item] == "object") replaceObjProps(obj[item],replacedPros)

    })
}


module.exports = commands;