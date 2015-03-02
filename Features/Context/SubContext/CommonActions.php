<?php

/**
 * File containing the Common Funtios context class for PlatformUI.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 * @version //autogentag//
 */

namespace EzSystems\PlatformUIBundle\Features\Context\SubContext;

use EzSystems\PlatformUIBundle\Features\Helper\JavaScript as JsHelper;

trait CommonActions
{
    /**
     * Waits for Javascript to finnish by running a empty Javascript
     * (In Sahi it's possible to have the same result by running an empty javascript only)
     */
    protected function waitForLastJs()
    {
        //Needs to be here
        $this->execJavascript( '' );

        $jsCode = "return BDD.isSomethingLoading();";

        while ( $this->evalJavascript( $jsCode ) )
        {
            usleep( 100 * 1000 ); // 100ms
        }
    }

    /**
     * Waits for Javascript to finnish by running a empty Javascript
     * (In Sahi it's possible to have the same result by running an empty javascript only)
     */
    protected function activateJsErrorHandler()
    {
        //Needs to be here
       // $this->execJavascript( '' );
        $jsCode = "return BDD.errorHandlerActivate();";
        $this->execJavascript( $jsCode );
    }

    /**
     * Evaluate javascript code and return result.
     *
     * @param  string  $jsCode
     * @return mixed
     */
    protected function evalJavascript( $jsCode, $addJsHelper = true )
    {
        if ( $addJsHelper )
        {
            $jsCode = JsHelper::getHelperJs() . $jsCode;
        }
        $jsCode = $this->driver->wrappedFunction( $jsCode );

        return $this->getSession()->evaluateScript( $jsCode );
    }

    /**
     * Execute javascript code and return result.
     *
     * @param  string  $jsCode
     * @return mixed
     */
    protected function execJavascript( $jsCode, $addJsHelper = true )
    {
        if ( $addJsHelper )
        {
            $jsCode = JsHelper::getHelperJs() . $jsCode;
        }

        $jsCode = $this->driver->wrappedFunction( $jsCode );

        return $this->getSession()->executeScript( $jsCode );
    }

    /**
     * Clicks on the PlatformUI logo
     *
     * @param string $text
     */
    protected function clickLogo()
    {
        $selector = 'img[alt="Logo eZ"]';
        $jsArg = JsHelper::generateFuncArgs( $selector );
        $jsCode = "return BDD.clickElement( $jsArg );";
        $this->execJavascript( $jsCode );
    }

    /**
     * Clicks on a PlatformUI tab
     *
     * @param string $text
     */
    protected function clickTab( $text )
    {
        $this->clickElementsByText( $text, ".ez-tabs-label a[href]" );
    }

    /**
     * Click on a PlatformUI menu zone
     *
     * @param string $text
     */
    protected function clickMenuZone( $text )
    {
        $this->clickElementsByText( $text, ".ez-zone-name" );
    }

    /**
     * Over on a PlatformUI menu zone
     *
     * @param string $text
     */
    protected function overMenuZone( $text )
    {
        $selector = ".ez-zone-name";
        $jsArgs = JsHelper::generateFuncArgs( $text, $selector );
        $jsCode = "return BDD.mouseOverElementByText( $jsArgs );";
        $this->execJavascript( $jsCode );
    }

    /**
     * Click on a PlatformUI menu link
     *
     * @param string $text
     */
    protected function clickMenuLink( $text )
    {
        $this->clickElementsByText( $text, '.ez-link a[href]' );
    }

    /**
     * click on a PlatformUI sub-menu option
     *
     * @param string $text
     */
    protected function clickSubMenuLink( $text )
    {
        $this->clickElementsByText( $text, '.ez-navigation-item' );
    }

    /**
     * click on a PlatformUI side menu option
     *
     * @param string $text
     */
    protected function clickSideMenuLink( $text )
    {
        $this->clickElementsByText( $text, '.ez-action p.action-label' );
    }

    /**
     * click on a PlatformUI side menu content type
     *
     * @param string $text
     */
    protected function clickContentType( $text )
    {
        $this->clickElementsByText( $text, '.ez-selection-filter-item' );
    }

    /**
     * Verifies the visibility of an html element
     *
     * @param   string  $text
     */
    protected function isElementVisible( $text, $selector )
    {
        $jsArgs = JsHelper::generateFuncArgs( $text, $selector );
        $jsCode = "return BDD.checkVisibility( $jsArgs );";
        $visibility = $this->evalJavascript( $jsCode );

        return $visibility;
    }

    /**
     * Fills a sub form with values
     *
     * @param   string    $text
     * @param   array     $values
     */
    protected function fillSubFormList( $text, $values )
    {
        $mainSelector = ".ez-editfield-infos";
        $ancestorSelector = ".ez-authors-input-container";
        $childSelector = ".ez-validated-input, .ez-field-sublabel";

        $jsArgs = JsHelper::generateFuncArgs( $text, $mainSelector, $values, $ancestorSelector, $childSelector );
        $jsCode = "return BDD.fillListPair( $jsArgs )";
        $this->execJavascript( $jsCode );
    }

    /**
     * Finds an HTML element by class and the text value and clicks it
     *
     * @param string $name
     */
    protected function clickElementsByText( $text, $selector )
    {
        $jsArgs = JsHelper::generateFuncArgs( $text, $selector );
        $jsCode = "return BDD.clickElementByText( $jsArgs );";
        $this->execJavascript( $jsCode );
    }

    /**
     * Finds an HTML element by class and the text value and returns it
     *
     * @param string $name
     */
    protected function checksElementsByText( $text, $selector )
    {
        $jsArgs = JsHelper::generateFuncArgs( $text, $selector );
        $jsCode = "return BDD.getElementByText( $jsArgs );";
        return $this->evalJavascript( $jsCode );
    }

    /**
     * Finds an HTML element by class and the text value and return the value of the sibling
     *
     * @param string $name
     */
    protected function checksElementSiblingValue( $text, $selector )
    {
        $jsArgs = JsHelper::generateFuncArgs( $text, $selector );
        $jsCode = "return BDD.checksElementSiblingValueByText( $jsArgs );";
        return $this->evalJavascript( $jsCode );
    }

    /**
     * Finds an HTML element by class and the text value and clicks/hovers it
     *
     * @param string $name
     */
    protected function clickContentTreeLink( $dir, $index = 0, $rootSelectorId = '' )
    {
        $path = explode( "/", $dir );

        $jsArgs = JsHelper::generateFuncArgs( $path, $index, $rootSelectorId );
        $jsCode = "return BDD.openTreePath( $jsArgs );";

        while ( ( $result = $this->evalJavascript( $jsCode ) ) === -1 )
        {
            usleep( 100 * 1000 ); // 100ms
        }

        if ( is_string( $result ) )
        {
            return $this->clickContentTreeLink( $dir, ++$index, $result );
        }
    }

    /**
     * Makes and element visible so a file can be attached to it
     *
     * @param string $path      file path relative to mink definitions
     * @param string $selector  selector of the element do to make visible
     */
    protected function attachFilePrepare( $path, $selector )
    {
        $jsArgs = JsHelper::generateFuncArgs( $selector );
        $jsCode = "return BDD.changeCssDisplay( $jsArgs );";
        $this->execJavascript( $jsCode );

        $this->attachFile( $path );
    }

    /**
     * Attaches a file to a input field en HTML
     *
     * @param string $path      file path relative to mink definitions
     */
    protected function attachFile( $path )
    {
        if ( $this->getMinkParameter( 'files_path' ) )
        {
            $fullPath = rtrim( realpath( $this->getMinkParameter( 'files_path' ) ), DIRECTORY_SEPARATOR ).DIRECTORY_SEPARATOR.$path;

            if ( is_file( $fullPath ) )
            {
                $fileInput = 'input[type="file"]';
                $field = $this->getSession()->getPage()->find( 'css', $fileInput );

                if ( null === $field )
                {
                    throw new Exception( "File input is not found" );
                }
            $field->attachFile( $fullPath );
            }
        }
        else throw new Exception( "File is not found at the given location" );
    }

    /**
     * Drops a file to an HTML element with specific text
     *
     * @param string $path      file path relative to mink definitions
     * @param string $selector  selector of the element where to drop the file
     */
    protected function dragAndDropFile( $path, $selector )
    {
        if ( $this->getMinkParameter( 'files_path' ) )
        {
            $fullPath = rtrim( realpath( $this->getMinkParameter( 'files_path' ) ), DIRECTORY_SEPARATOR ).DIRECTORY_SEPARATOR.$path;

            if ( is_file( $fullPath ) )
            {
                $fileName = $path;
                $finfo = finfo_open( FILEINFO_MIME_TYPE );
                $fileType = finfo_file( $finfo, $fullPath );
                $contents = file_get_contents( $fullPath );
                $contentBase64 = base64_encode( $contents );

                $jsArgs = JsHelper::generateFuncArgs( $fileName, $fileType, $contentBase64, $selector );
                $jsCode = "return BDD.simulateDropEventWithFile( $jsArgs );";
                $jsFile = $this->execJavascript( $jsCode );
            }
        }
        else throw new Exception( "File is not found at the given location" );
    }

    /**
     * Finds an HTML element by class and the text value and return the value of the sibling
     *
     * @param string $name
     */
    protected function checksImagePresent( $text, $selector )
    {
        $jsArgs = JsHelper::generateFuncArgs( $text, $selector );
        $jsCode = "return BDD.getImgSrc( $jsArgs );";
        return $this->evalJavascript( $jsCode );
    }

    /**
     * Finds an HTML element by class and the text value and return the value of the sibling
     *
     * @param string $name
     */
    protected function getFileUrl( $text, $selector )
    {
        $jsArgs = JsHelper::generateFuncArgs( $text, $selector );
        $jsCode = "return BDD.getLinkUrl( $jsArgs );";
        return $this->evalJavascript( $jsCode );
    }

    /**
     * Get the current window Node Id
     *
     * @return string
     */
    protected function getThisContentId()
    {
        $jsCode = "return BDD.getWindowHash();";
        $hash = $this->evalJavascript( $jsCode );
        $hash = explode( '/', $hash );
        $lastElement = end( $hash );
        return $lastElement;
    }
}
