/**
 * Created by milkana on 15/07/15.
 */


    var ErrorHandler = require("./ErrorHandler.js");
    var config = require("./Config.js");
    var Log = require("./CustomLogger.js");
    //var Utils = require("kennelUtils.js");

    var mergeOptions = function(obj1,obj2){
        var obj3 = {};
        for (var attr in obj1) { obj3[attr] = obj1[attr]; }
        for (var attr in obj2) { obj3[attr] = obj2[attr]; }
        return obj3;
    };

    var environmentConfigurations = {

        getConfig : function(platform,env){
            // if the env is set
            if(env) {
                var currentEnv = config[platform][env];
                Log.print("The loaded env. is " + JSON.stringify(currentEnv));
                return currentEnv;
            }
            else
                Log.print('The wanted env. is not defined' + JSON.stringify(env));
        },

        //platform    =  ios / android
        //env         =  Dev, QA_Beta, QA_Stable ...
        //serverName =  appium/crosswalk
        getCaps: function(platform,env,device,serverName){
          //  Log.print("in get caps, platform =" + platform + ", env =" + env + ", device =" + device + ", serverName =" + serverName );
             Logger.debug("in get caps, platform =" + platform + ", env =" + env + ", device =" + device + ", serverName =" + serverName );
            var currentCaps =  {};
             if (platform === 'ios' || platform === 'Android') {
                currentCaps["platformName"]= platform;
                currentCaps["platformVersion"]= getPref("watchdog.wildcat.platformVersion");
                currentCaps = mergeOptions(config[platform].general, currentCaps);
                currentCaps["deviceName"] = getPref("watchdog.wildcat.deviceName");
                currentCaps["automationName"] = "UiAutomator2";
                currentCaps["env"]= env;
                currentCaps["appPackage"] = getPref("watchdog.wildcat.appPackage");
                currentCaps["appActivity"] = getPref("watchdog.wildcat.appActivity");
                currentCaps["appWaitActivity"] = getPref("watchdog.wildcat.appActivity");
             }
            if (platform === 'Android'){
                currentCaps["nativeWebScreenshot"] = true;
                currentCaps["recreateChromeDriverSessions"] = true;
                currentCaps = mergeOptions(getPref("desiredCapabilities"), currentCaps);
            }
            if(platform === 'chrome') {
                currentCaps = mergeOptions(getPref("desiredCapabilities"), currentCaps);
            }


           // Log.print("the choosen caps are " + JSON.stringify(currentCaps));
            Logger.debug("the choosen caps are " + JSON.stringify(currentCaps));
            return currentCaps;
        },

        getAppiumIP : function(platform,device){
            var ip = getPref("watchdog.wildcat.appiumIp") || config[platform].servers.connectedDevices[device].Appium_IP;
            Log.print("The Appium_IP is : " + ip);
            return ip;
        },

        getTestDevice : function(platform,device){
            return config[platform].servers.connectedDevices[device];
        },

        getSelendroidIP :function(platform,env){
            return getPref("seleniumIP") || config[platform].env[env].ip;
        },

        getSelendroidStartUrl :function(platform,env){
            return config[platform].env[env].url;
        }

    };

module.exports = environmentConfigurations;

