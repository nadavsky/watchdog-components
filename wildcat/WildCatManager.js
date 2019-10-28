/**
 * Created by milkana on 15/07/15.
 */
var currentConfig = {};
var request= require("sync-request");
var ErrorHandler = require("./ErrorHandler.js");
var Log = require("./CustomLogger.js");
var config = require("./EnvConfig.js");



var WildCatUtils = {
        init: function (server, platform) {
            var env = getPref("wildcat_env") || 'Local';
            var device = getPref("wildcat_platform") || "Device type not set";
            platform = platform ? platform : (!platform && device.indexOf("Android") > -1) ? "Android" : device.indexOf("ios") > -1 ? "ios" : "chrome" ;
            currentConfig["platform"] = platform;
            currentConfig["env"] = env;

            if(!env){
                Logger.error("Missing env value")
            }
            else if (env !== "Local") {
                currentConfig["Appium_IP"] =  config.getAppiumIP(platform, device);
                currentConfig["selenium_IP"] = config.getSelendroidIP(platform,env);
            }
            else {
                currentConfig["Appium_IP"] = getPref("watchdog.wildcat.appiumIp") || "http://127.0.0.1:4723";
                currentConfig["selenium_IP"] = config.getSelendroidIP(platform,env) || "there is no selenium ip";

            }
            currentConfig["platform"] = platform;

            var caps = config.getCaps(platform, env, device, server || "appium");
            var appUrl = getPref("wildcat_localAppUrl");
            caps.app = appUrl ? appUrl : getPref("wildcat_appUrl");

            currentConfig["AppiumCaps"] = {desiredCapabilities: caps};
            currentConfig["SelendroidCaps"] = {desiredCapabilities:caps};

            currentConfig["host"] = platform === "chrome" ? currentConfig["selenium_IP"] : currentConfig["Appium_IP"];

            Logger.debug("We are using the follow configuration now " +  JSON.stringify(currentConfig));
            //Log.print("We are using the follow configuration now " +  JSON.stringify(currentConfig));
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
            setPref("wildcat_runTime_sessionId", sessionId)
        },

        getSessionId: function (appium = false) {
            return getPref("wildcat_runTime_sessionId") || currentConfig[appium ? "sessionIdAppium" : "sessionId"];
            //return  currentConfig[appium ? "sessionIdAppium" : "sessionId"];
        },

        getBundleId :function(){
            return getPref("wildcat_appPackage") || config.android[currentConfig.env].appPackage;
        },

        getAppPath :function(){
            return getPref("wildcat_appUrl") || config[currentConfig.platform][currentConfig.env].app;
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
            var url = _buildUrl(this.props.relPath, this.props.absPath);
            var responseText ,resBody;



          Logger.debug("before sending request " + url );
           // Log.print("before sending request " + url );
            var headers = {"Accept": "application/json","Content-type": "application/json"}
            var response = request(props.method, url, {headers:headers, timeout:10000, body:props.data});
            Logger.debug("---> REQUEST " + props.method + " " + url + " data: " + JSON.stringify(props.data));
            // Log.print("---> REQUEST " + props.method + " " + url + " data: " + JSON.stringify(props.data));


            if (response) {
                try{
                    resBody = response.body.toString('utf-8');
                }
                catch (e){
                    Log.print("Exception : " + JSON.stringify(e));
                    props.cb("the response is not in JSON format", JSON.stringify(resBody));
                }
                var requestToPrint
                if (response && resBody.toString('utf-8').length > 10000)  requestToPrint = "responseText is too long... you can find it in your network tab." ;
                responseText = response.body.toString('utf-8');
               Logger.debug("<--- RESPONSE status " + response.statusCode + " " + url + " " + requestToPrint);
               // Log.print("<--- RESPONSE status " + response.statusCode + " " + url + " " + requestToPrint);
                if (response.statusCode == 200) {
                    props.cb(null, responseText, response);
                }
                else {
                    props.cb(ErrorHandler(resBody.status), null,response);
                }
            }
            else {

                props.cb(ErrorHandler(`Wildcat didn't succeed to receive response. Please check if the server is up : ${currentConfig.host}`), null);
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
            //Utils.setPref("wildcat_runTime_elemId", elemId)
            setPref("wildcat_runTime_elemId", elemId)
        },

        getElemId: function () {
            return getPref("watchdog_wildcat_runTime_elemId") || currentConfig["elemId"];
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
    var isAppiumCmd = (relPath && relPath.indexOf("appium") > 0) || (absPath && absPath.indexOf("appium") > 0) ? true : false;
    var sessionNow = "nosession";
    var path;

    if(WildCatUtils.isRunningChromeNow() && !isAppiumCmd){
        currentConfig.host = currentConfig.selenium_IP;
        sessionNow =  currentConfig["sessionId"];
        path = currentConfig.host
    }
    else{
        currentConfig.host = currentConfig.Appium_IP;
        sessionNow =  currentConfig["sessionId"];
        path = currentConfig.host + "/wd/hub"
    }

    if(relPath) path += relPath;
    if(absPath) path += absPath;

    path = path.replace(":sessionId", sessionNow);//.replace(":id", currentConfig["elemId"]);
    return path;
};

module.exports = WildCatUtils;
