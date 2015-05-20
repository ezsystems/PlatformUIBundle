/*
 * File containing all Javascript implentations for the PlatformUI BDD
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 * @version //autogentag//
 */

/**
 * Container for Javascript functions
 *
 * @returns {PlatformUIHelper}
 */
function PlatformUIHelper(){
    //YUI global object with node-event-simulate module
    var Y = YUI().use('node-event-simulate', 'stylesheet');

    /**
     * Clicks on a specific HTML element
     *
     * @param {HTML ELement / string} element/selector
     * @returns {Boolean}
     */
    this.clickElement = function (element){
        // if using a selector, convert to Y element first
        if ( typeof( element ) == 'string' )
            element = Y.one( element );

        if (!element)
            return false;
        element.simulate("focus");
        element.simulate("mousedown");
        element.simulate("mouseup");
        element.simulate("click");
        return true;
    }

    /**
     * Mouse over on a specific HTML element
     *
     * @param {HTML ELement / string} element/selector
     * @returns {Boolean}
     */
    this.mouseOverElement = function (element){
        // if using a selector, convert to Y element first
        if ( typeof( element ) == 'string' )
            element = Y.one( element );

        if (!element)
            return false;
        element.simulate("focus");
        element.simulate("mouseover");
        return true;
    }

    /**
     * Get an HTML element using a selector and its text
     *
     * @param {string} text
     * @param {sting} selector
     */
    this.getElementByText = function (text, selector, index = 1){
        var rightElement = null;
        var currentIndex = 1;
        Y.all(selector).some(function (element) {
            var textContent = Y.DOM.getText( element.getDOMNode() ).trim();
            var textEquals = (textContent == text);
            if ( textEquals ){
                if( currentIndex == index ){
                    rightElement = element;
                    return true;
                }
                else{
                currentIndex++;
                }
            }
        }, this);

        return rightElement;
    }

    /**
     * Finds an element by text and clicks on it
     *
     * @param {string} text
     * @param {string} selector
     */
    this.clickElementByText = function(text, selector, index = 1){
        var success = this.clickElement(
                this.getElementByText(text, selector, index)
                );

        if(!success)
            throw new Error("Element: " + text + " not found");
    }

    /**
     * Finds an element by text and mouse over on it
     *
     * @param {string} text
     * @param {string} selector
     */
    this.mouseOverElementByText = function(text, selector)
    {
        var success = this.mouseOverElement(
                this.getElementByText(text, selector)
                );

        if(!success)
            throw new Error("Element: " + text + " not found");
    }

    /**
     * Finds an element by text and checks value
     *
     * @param {string} text
     * @param {string} selector
     */
    this.checksElementSiblingValueByText = function(text, selector){
        var siblingValue;
        var element = this.getElementByText(text, selector);
        element.siblings().each( function(e) {
            siblingValue = Y.DOM.getText( e.getDOMNode() ).trim();
        });
        return siblingValue;
    }

    /**
     * Gets an element list with an specific
     *
     * @param {Node} element
     * @param {string} ancestorSelector
     * @param {string} childSelector
     */
    this.getAncestorSpecificList = function(element, ancestorSelector, childSelector){
        var elemList = element.ancestor(ancestorSelector).all(childSelector);
        return elemList;
    }

    /**
     * Fills a pair list with all the given values
     *
     * @param   {string}    text
     * @param   {string}    mainSelector
     * @param   {object}    values
     * @param   {string}    ancestorSelector
     * @param   {string}    childSelector
     */
    this.fillListPair = function(text, mainSelector, values, ancestorSelector, childSelector){
        for(j = 0; j < values.size; j++){
            this.fillSinglePair( text, mainSelector, values, ancestorSelector, childSelector);
        }
    }

    /**
     * Fills a single pair with the given value
     *
     * @param   {string}    text
     * @param   {string}    mainSelector
     * @param   {object}    values
     * @param   {string}    ancestorSelector
     * @param   {string}    childSelector
     */
    this.fillSinglePair = function(text, mainSelector, values, ancestorSelector, childSelector){
        var mainElement = this.getElementByText( text, mainSelector );
        var elemList = this.getAncestorSpecificList( mainElement, ancestorSelector, childSelector );

        var nextLabel, currentLabel, labelList = [];
        elemList.some(function (e) {

            currentLabel = Y.DOM.getText( e.getDOMNode() ).trim();
            if(currentLabel != '' && currentLabel != undefined ){
                nextLabel = currentLabel;
                for(i = 0; i < labelList.length; i++){
                    if(currentLabel == labelList[i]){
                        return true;
                    }
                }
            }
            else{
                if(e.get('value') == ''){
                    labelList.push( nextLabel );
                    e.set('value', values[nextLabel][0]);

                    var event = document.createEvent("HTMLEvents");
                    event.initEvent("blur", true, true);
                    e.getDOMNode().dispatchEvent(event);

                    values[nextLabel].shift();
                }
            }
        });
    }

    /**
     * Checks the visibility of an html element
     *
     * @param   {string}    text
     * @param   {string}    selector
     * @returns {boolean}
     */
    this.checkVisibility = function( text, selector ){
        var element = this.getElementByText( text, selector );
        if( element == null){
            return false;
        }
        element = element.getDOMNode();

        var visibility = ( element.offsetParent !== null );

        return visibility;
    }
    /**
     * Specific function used to open a content Tree path
     *
     * @param   {array}     path
     * @param   {integer}   level
     * @param   {string}    rootSelectorId
     * @returns {Number|Boolean}
     */
    this.openTreePath = function (path, level, rootSelectorId){
        var rootNode;
        if (rootSelectorId === '')
            rootNode = Y.one('.ez-platformui-app-body'); // FIXME
        else
            rootNode = Y.one('#' + rootSelectorId);

        if (!rootNode)
            return false;

        var result = false;
        if (level < path.length - 1){
            var nodes = rootNode.all('.ez-tree-node');

            nodes.some(function (elem){
                leafNode = elem.one('.ez-tree-navigate');
                if (leafNode.get('text') === path[level]){
                    if (!elem.hasClass('is-tree-node-open')){
                        this.clickElement(elem.one('.ez-tree-node-toggle'));
                        result = -1;
                    }

                    if (elem.hasClass('is-tree-node-loading'))
                result = -1;

            var newRoot = elem.one('ul.ez-tree-level');
            if (newRoot)
                result = newRoot.generateID();

            return true;
                }
            }, this);
            return result;
        }
        else{
            leafNode = rootNode.one('.ez-tree-navigate');
            return this.clickElement(leafNode);
        }
    }

    /**
     * Transforms a file into javascript data and the drops it on top of an element
     *
     * @param {String} fileName     name of the file
     * @param {String} fileType     MIME type of the file
     * @param {String} cotentBase64 contents of file in base 64
     * @param {String} selector     element selector
     */
    this.simulateDropEventWithFile = function( fileName, fileType, contentBase64, selector ){
        jsFile = new Blob( [this.base64DecToArr( contentBase64 )], {type: fileType});
        jsFile.name = fileName;
        jsFile.lastModifiedDate = new Date();
        jsFile.webkitRelativePath = "";

        var filesArray = Array();
        filesArray.push( jsFile );
        var event = document.createEvent("HTMLEvents");
        event.initEvent("drop", true, true);
        event.dataTransfer = { files: filesArray };
        window.document.getElementsByClassName(selector)[0].dispatchEvent(event);
    }

    /**
     * Makes an element visible by changing its CSS style
     *
     * @param {String} selector     element selector
     */
    this.changeCssDisplay = function( selector ){
        Y.StyleSheet('NewStyle').set( selector, { display: 'inline' });
    }

    /**
     * Checks if javascript is active
     *
     * @returns {Boolean}
     */
    this.isSomethingLoading = function(){
        var classList = [
        '.yui3-app-transitioning',
        '.is-app-loading',
        '.is-app-transitioning',
        // content tree
        '.ez-view-treeactionview.is-expanded .ez-view-treeview:not(.is-tree-loaded)',
        '.is-tree-node-loading',
        // contenttype menu
        '.ez-view-createcontentactionview.is-expanded:not(.is-contenttypeselector-loaded)'
        ];

        var exists = Y.one( classList.join(',') );
        return exists !== null;
    }

    /**
     * Get the current URL hash
     *
     * @returns {String.hash|window.location.hash|ret.cfg.redirect_uri.hash|DOMString}
     */
    this.getWindowHash = function(){
        return window.location.hash;
    }

    /**
     * Finds an image by text and extracts its source
     *
     * @param {string} text
     * @param {string} selector
     */
    this.getImgSrc = function(text, selector)
    {
        var imgSrc;
        var element = this.getElementByText(text, selector);

        element.siblings().each(function(e){
            imgSrc = e.one('img').getDOMNode().src;
        });
        return imgSrc;
    }

    /**
     * Finds an link by text and extracts url
     *
     * @param {string} text
     * @param {string} selector
     */
    this.getLinkUrl = function(text, selector)
    {
        var url;
        var element = this.getElementByText(text, selector);

        element.siblings().each(function(e){
            url = e.one('a').getDOMNode().href;
        });
        return url;
    }

    /**
     * Makes an alert pop up whenever there is a javascript error(used to alert webdriver about the error)
     */
    this.errorHandlerActivate = function()
    {
        window.onerror = function (errorMsg, url, lineNumber) {
            throw new Error('Error: ' + errorMsg );
        }
    }

    /**
     * Array of bytes to base64 string decoding
     * Mozzilla: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Base64_encoding_and_decoding
     * https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding#Appendix.3A_Decode_a_Base64_string_to_Uint8Array_or_ArrayBuffer
     */
    this.b64ToUint6 = function(nChr){
        return nChr > 64 && nChr < 91 ?
            nChr - 65
            : nChr > 96 && nChr < 123 ?
            nChr - 71
            : nChr > 47 && nChr < 58 ?
            nChr + 4
            : nChr === 43 ?
            62
            : nChr === 47 ?
            63
            :
            0;
    }

    /**
     * Mozzilla: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Base64_encoding_and_decoding
     * https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding#Appendix.3A_Decode_a_Base64_string_to_Uint8Array_or_ArrayBuffer
     */
    this.base64DecToArr = function( sBase64, nBlocksSize ){
        var sB64Enc = sBase64.replace( /[^A-Za-z0-9\+\/]/g, "" ), nInLen = sB64Enc.length,
            nOutLen = nBlocksSize ? Math.ceil( ( nInLen * 3 + 1 >> 2 ) / nBlocksSize ) * nBlocksSize : nInLen * 3 + 1 >> 2, taBytes = new Uint8Array( nOutLen );
        for ( var nMod3, nMod4, nUint24 = 0, nOutIdx = 0, nInIdx = 0; nInIdx < nInLen; nInIdx++ ){
            nMod4 = nInIdx & 3;
            nUint24 |= this.b64ToUint6( sB64Enc.charCodeAt( nInIdx ) ) << 18 - 6 * nMod4;
            if ( nMod4 === 3 || nInLen - nInIdx === 1 ){
                for ( nMod3 = 0; nMod3 < 3 && nOutIdx < nOutLen; nMod3++, nOutIdx++ ){
                    taBytes[nOutIdx] = nUint24 >>> ( 16 >>> nMod3 & 24 ) & 255;
                }
                nUint24 = 0;
            }
        }
        return taBytes;
    }
}

var BDD = new PlatformUIHelper();
