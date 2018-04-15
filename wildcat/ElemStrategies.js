/**
 * Created by milkana on 23/07/15.
 */

var ErrorHandler = require("./ErrorHandler.js");



//elemSelector should be at the following format {"xpath" : ".////" }
var findStrategy = function(elemSelector){

    var result = {
        //using - {string} The locator strategy to use.
        using : "",
        //value - {string} The The search target.
        value : ""
    };

    if(typeof elemSelector !== "string")
        return ErrorHandler("In Elem findStrategy. The call should be with 'string' and we received type of " + typeof elemSelector);

    function findChoosenStrategy(identifier, strategy){
        if(elemSelector.indexOf(identifier) === 0){
            //we are using a css selector
            result.using = strategy;
            result.value = elemSelector.replace(identifier,'');
        }
    }
    //These strategies are NOT supported
    //    name	            -->    Returns all elements whose NAME attribute matches the search value.
    //    link text	        -->    Returns all anchor elements whose visible text matches the search value.
    //    partial link text -->	   Returns all anchor elements whose visible text partially matches the search value.


    //These strategies are ARE supported
    //Store can use everything and Mobile should use the css selector or the xpath
    //    css selector	    -->    Returns all elements matching a CSS selector.
    findChoosenStrategy("css:","css selector");

    //xpath	-->Returns all elements matching an XPath expression.
    findChoosenStrategy("xpath:","xpath");

    //class name -->Returns all elements whose class name contains the search value; compound class names are not permitted.
    findChoosenStrategy("className:","class name");

    //id -->Returns all elements whose ID attribute matches the search value
    findChoosenStrategy("id:","id");

    //tag name -->Returns all elements whose tag name matches the search value.
    findChoosenStrategy("tagName:","tag name");

    //tag name -->Returns an element whose NAME attribute matches the search value.
    findChoosenStrategy("name:","name");

    //tag name -->Returns an element whose class name contains the search value; compound class names are not permitted.
    findChoosenStrategy("class name:","class");

    //tag name -->Returns an anchor element whose visible text matches the search value.
    findChoosenStrategy("link text:","linkText");

    //tag name -->Returns an element whose class name contains the search value; compound class names are not permitted.
    findChoosenStrategy("class name:","class");

    return result;
};

module.exports = findStrategy;