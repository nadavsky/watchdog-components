/**
 * Created by milkana on 19/07/15.
 */
//response
const RESPONSE_COLOR = "blue";
const REQUEST_COLOR  = "green";
const ERROR_COLOR  = "red";

function colorTrace(msg, color) {
    console.log(msg, "color:" + color + ";font-weight:bold;");
}

(function(){
    var Log = {
        print: function(msg){
            if (typeof msg === "object") {
                console.log(JSON.stringify(msg));
                Logger.debug(JSON.stringify(msg));
            }
            else {
                if(msg.includes("RESPONSE") && !msg.includes("200"))
                    colorTrace(msg, ERROR_COLOR);
                else if (msg.includes("RESPONSE")){
                    colorTrace(msg, RESPONSE_COLOR);
                }
                else if(msg.includes("REQUEST"))
                    colorTrace(msg, REQUEST_COLOR);
                else
                  console.log(msg);
                //Logger.debug(msg);
            }
        }
    };
    exports(Log);
})();