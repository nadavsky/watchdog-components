/**
 * Created by milkana on 15/07/15.
 */
var currentConfig = {};
var ErrorHandler = require("./ErrorHandler.js");
var Log = require("./CustomLogger.js");
var config = require("./EnvConfig.js");
//var Utils = require("kennelUtils.js");


var WildCatUtils = {
        init: function (server, platform) {
            var env = getPref("watchdog.wildcat.Env") || 'Local';
            var device = getPref("watchdog.wildcat.platform") || "Device type not set";
            platform = (!platform && device.indexOf("android") > -1) ? "android" : device.indexOf("ios") > -1 ? "ios" : "chrome" ;
            currentConfig["platform"] = platform;
            currentConfig["env"] = env;

            if(!env){
                Logger.error("Missing env value")
            }
            else if (env !== "Local") {
                currentConfig["Appium_IP"] =  config.getAppiumIP(platform, device);
                //currentConfig["Selendroid_IP"] = config.getSelendroidIP(platform,env);
                //currentConfig["StoreUrl"] = config.getSelendroidStartUrl(platform,env) || "http://127.94.0.3:4444";
            }
            else {
                currentConfig["Appium_IP"] = "http://127.0.0.1:4723";
                //currentConfig["Selendroid_IP"] = config.getSelendroidIP(platform,env) || "http://127.94.0.3:4444";
                //currentConfig["StoreUrl"] = config.getSelendroidStartUrl(platform,env) || "http://127.94.0.3:4444";
            }
            currentConfig["platform"] = platform;

            var caps = config.getCaps(platform, env, device, server || "appium");
            var storeUrl = getPref("watchdog.localStoreUrl");
            caps.app = storeUrl ? storeUrl : getPref("watchdog.wildcat.appUrl");

            currentConfig["AppiumCaps"] = {"desiredCapabilities": caps};
            currentConfig["SelendroidCaps"] = {desiredCapabilities: {
                browserName: "chrome"
            }};

            currentConfig["host"] = platform === "chrome" ? currentConfig["Selendroid_IP"] : currentConfig["Appium_IP"];

            Log.print("We are using the follow configuration now " +  JSON.stringify(currentConfig));
            //Log.print("The used capabilities are device is "       +  JSON.stringify(caps));
            return currentConfig;
        },

        setHost: function (host) {
            currentConfig[host] = host;
        },

        getCurrentCaps: function (installApp=true) {
            Logger.debug("---getCurrentCaps---")
            if(WildCatUtils.isRunningChromeNow()) return currentConfig["SelendroidCaps"];
            if(installApp)
                return currentConfig["useCrossWalk"] ? currentConfig["crossWalkCaps"] : currentConfig["AppiumCaps"];
            else
                if(WildCatUtils.isAndroidRunningNow()){
                Logger.debug("getCurrentCaps : android")
                    return currentConfig["AppiumCaps"];
                }
                else {
                    return currentConfig["useCrossWalk"] ? currentConfig["crossWalkCaps"] : currentConfig["AppiumCaps"];
                }
        },

        setSessionId: function (sessionId, appium = false) {
            currentConfig[appium ? "sessionIdAppium" : "sessionId"] = sessionId;
            setPref("watchdog.wildcat.runTime.sessionId", sessionId)
        },

        getSessionId: function (appium = false) {
            return getPref("watchdog.wildcat.runTime.sessionId") || currentConfig[appium ? "sessionIdAppium" : "sessionId"];
            //return  currentConfig[appium ? "sessionIdAppium" : "sessionId"];
        },

        getBundleId :function(){
            return getPref("watchdog.wildcat.androidPackage") || config.android[currentConfig.env].androidPackage;
        },

        getAppPath :function(){
            return getPref("watchdog.wildcat.appUrl") || config[currentConfig.platform][currentConfig.env].app;
        },

        getStoreUrl : function(){
            return config.getSelendroidStartUrl(currentConfig.platform,currentConfig.env);
        },

        sendRequest: function (method, path, cb, data, abs = false, async=false) {
            this.props = {};

            if (typeof(method) === "object") {
                this.props = method;
            }
            else {
                this.props["method"] = method;
                this.props[abs ? "absPath" : "relPath"] = path;
                this.props["cb"] = cb;
                this.props["data"] = data;
            };

            var props = this.props;
            var xhr = new XMLHttpRequest();
            var url = _buildUrl(this.props.relPath, this.props.absPath);
            var responseText;
            //var url = this.props.relPath;


            Log.print("before sending xhr request " + url );
            xhr.open(props.method, url, async);
            xhr.setRequestHeader("Accept", "application/json");
            xhr.setRequestHeader("Content-type", "application/json");
            xhr.onerror = function (e) {
                Log.print("The request failed." + JSON.stringify(xhr) +   JSON.stringify(e));
                props.cb(ErrorHandler(`Wildcat didn't succeed to receive response. Please check if the server is up : ${currentConfig.host}`), null);
            };
            xhr.onload = function (e) {

                try {
                    var response = JSON.parse(xhr.responseText);
                }
                catch (e) {
                    Log.print("Exception : " + JSON.stringify(e));
                    props.cb("the response is not in JSON format", this.responseText);
                }
                if (response && JSON.stringify(responce).length > 100000)  responseText = "responseText is too long... you can find it in your network tab." ;
                else responseText = JSON.stringify(responce)
                Log.print("<--- RESPONCE status " + xhr.status + " " + url + " " + responseText);
                if (xhr.status == 200) {props.cb(null, this.responseText, response);}
                else {props.cb(ErrorHandler(xhr.status), null,response);
                    //throw new ErrorHandler(xhr && xhr.responseText);
                }
            };

            Log.print("---> REQUEST " + props.method + " " + url + " data: " + JSON.stringify(props.data));
            try {
                if(async) xhr.timeout = 5000;
                xhr.send(props.data);
            }
            catch(e){
                props.cb("The server is down.... " + `Wildcat didn't succeed to receive response. Please check if the server is up : ${currentConfig.host}`, this.responseText)
            }

        },

        isAndroidRunningNow: function () {
            return !(currentConfig["platform"] === "ios" || currentConfig["platform"] === "chrome")
        },

        isRunningChromeNow : function(){
            //Log.print("Is running chrome now ...");
            return currentConfig["platform"] === "chrome";
        },

        isRunningIOSNow : function(){
            //Log.print("Is running ios now ...")
            return currentConfig["platform"] === "ios";
        },

        usingCrossWalk: function (shouldUse) {
            currentConfig["useCrossWalk"] = shouldUse;
        },

        isUsingCrossWalk: function () {
            return currentConfig["useCrossWalk"];
        },

        setElemId: function (elemId) {
            currentConfig["elemId"] = elemId;
            Utils.setPref("watchdog.wildcat.runTime.elemId", elemId)
        },

        getElemId: function () {
            return getPref("watchdog.wildcat.runTime.elemId") || currentConfig["elemId"];
        },

        getOutputPath: function () {
            return getPref("watchdog.outputPath");
        },


    };


function deepCopy(oldObj,att) {
    var newObj = oldObj;
    if (oldObj && typeof oldObj === 'object') {
        newObj = Object.prototype.toString.call(oldObj) === "[object Array]" ? [] : {};
        for (var i in oldObj) {
            console.log("i " + i + " = " + newObj[i]);
            if(i!=att) newObj[i] = deepCopy(oldObj[i],att);
        }
    }
    return newObj;
}


function _buildUrl(relPath, absPath){
    Log.print("Using crossWalk " + WildCatUtils.isUsingCrossWalk());
    var isAppiumCmd = (relPath && relPath.indexOf("screenshot") > 0)||(relPath && relPath.indexOf("appium") > 0) || (absPath && absPath.indexOf("appium") > 0) ? true : false;
    var sessionNow = "nosession";

    if(WildCatUtils.isUsingCrossWalk() && !isAppiumCmd) {
        currentConfig.host = currentConfig.CrossWalk_IP;
        sessionNow =  currentConfig["sessionId"];
    }
    else if(WildCatUtils.isRunningChromeNow() && !isAppiumCmd){
        currentConfig.host = currentConfig.Selendroid_IP;
        sessionNow =  currentConfig["sessionId"];
    }
    else{
        currentConfig.host = currentConfig.Appium_IP;
        sessionNow =  currentConfig["sessionId"];
    }
    var path = currentConfig.host;
    if(relPath) {
        if (currentConfig.host === currentConfig.Appium_IP  || currentConfig.host === currentConfig.Selendroid_IP ) {
            path += "/wd/hub"
        }
        path += relPath;
    }
    if(absPath) path += absPath;

    path = path.replace(":sessionId", sessionNow);//.replace(":id", currentConfig["elemId"]);
    Log.print("The path that we ar going to use is " + path);
    return path;
};

module.exports = WildCatUtils;
