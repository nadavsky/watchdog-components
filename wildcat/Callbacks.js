/**
 * Created by milkana on 19/07/15.
 */
var ErrorHandler = require("./ErrorHandler.js");
var Log = require("./CustomLogger.js");

var blankCB = function(err,data){data ? Log.print(data) : Logger.debug("Blank callback without data")};

var callbacks = {
    //we didn't expect response data
    basic: function(cb){
        cb = cb || blankCB;
        return function(err, data){
            //cleanup rule
            if(err) return cb(err, null);
         //  Log.print("******* in the callback function --> _basic");
            Logger.debug("******* in the callback function --> _basic");
            //we expect that there is not a data at the responce
            if(data === '' || (data === 'OK') || data === true || !data){
                cb(null,null);
            }
            else{
                //let's try to find out what type of response was received
                var jsonRes;
                try{jsonRes = JSON.parse(data);}catch(ex){};

                //if the parse was successful ?
                if(jsonRes){
                    // the request was sucessful
                    if(jsonRes.status === 0){
                        cb();
                    }
                    else {
                        cb(ErrorHandler(jsonRes.status,(jsonRes.value && jsonRes.value.message) || jsonRes))
                    }
                }
                else{
                    cb(ErrorHandler(null,`Unexpected message. We didn't succeed to parse the recponse ${jsonRes}`));
                }
            }
        }
    },

    _withDataBase: function(cb){
        cb = cb || blankCB;
        return function(err, data){
            var obj, alertText;

            if(err) { return cb(err,data); }
            try {
                obj = JSON.parse(data);
                //Log.print("data" +  data);
            } catch (e) {
                cb(ErrorHandler("Not JSON response"),null);
            }
            if (obj.status > 0) {
                cb(ErrorHandler(obj.status, "Error code"),null);
            } else {
                cb(null,obj);
            }
        }
    },

    withData: function(cb){
        cb = cb || blankCB;
        return callbacks._withDataBase(function(err,obj){
            cb(err, obj);
        })
    }
};

module.exports = callbacks;

