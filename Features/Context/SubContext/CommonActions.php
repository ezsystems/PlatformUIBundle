<?php

/**
 * File containing the Common Functions for context class PlatformUI.
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
        //$this->execJavascript( '' );
        $jsCode = "return BDD.errorHandlerActivate();";
        $this->execJavascript( $jsCode );
    }

    /**
     * Evaluate javascript code and return result.
     *
     * @param   string  $jsCode
     * @return  mixed
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
     * @param   string  $jsCode
     * @return  mixed
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
     * @param   string  $text
     */
    protected function clickLogo()
    {
        $selector = '.ez-logo a';
        $jsArg = JsHelper::generateFuncArgs( $selector );
        $jsCode = "return BDD.clickElement( $jsArg );";
        $this->execJavascript( $jsCode );
    }

    /**
     * Clicks on a PlatformUI tab
     *
     * @param   string  $text
     */
    protected function clickTab( $text )
    {
        $this->clickElementByText( $text, ".ez-tabs-label a[href]" );
    }

    /**
     * Click on a PlatformUI menu zone
     *
     * @param   string  $text
     */
    protected function clickNavigationZone( $text )
    {
        $this->clickElementByText( $text, ".ez-zone-name" );
    }

    /**
     * Over on a PlatformUI menu zone
     *
     * @param   string  $text
     */
    protected function overNavigationZone( $text )
    {
        $selector = ".ez-zone-name";
        $jsArgs = JsHelper::generateFuncArgs( $text, $selector );
        $jsCode = "return BDD.mouseOverElementByText( $jsArgs );";
        $this->execJavascript( $jsCode );
    }

    /**
     * Click on a PlatformUI sub-menu option
     *
     * @param   string  $text
     */
    protected function clickNavigationItem( $text )
    {
        $this->clickElementByText( $text, '.ez-navigation-item' );
    }

    /**
     * Click on a PlatformUI side menu option
     *
     * @param   string  $text
     */
    protected function clickActionBarAction( $text )
    {
        $this->clickElementByText( $text, '.ez-action' );
    }

    /**
     * Click on a PlatformUI side menu content type
     *
     * @param   string  $text
     */
    protected function clickContentType( $text )
    {
        $this->clickElementByText( $text, '.ez-contenttypeselector-types .ez-selection-filter-item ' );
    }

    /**
     * Verifies the visibility of an HTML element
     *
     * @param   string  $text       Text value of the element
     * @param   string  $selector   CSS selector of the element
     * @return  boolean
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
     * @param   string    $text     Sub form label text
     * @param   array     $values   Values to fill in the sub form
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
     * @param   string  $text       Text value of the element
     * @param   string  $selector   CSS selector of the element  
     */
    protected function clickElementByText( $text, $selector )
    {
        $jsArgs = JsHelper::generateFuncArgs( $text, $selector );
        $jsCode = "return BDD.clickElementByText( $jsArgs );";
        $this->execJavascript( $jsCode );
    }

    /**
     * Finds an HTML element by class and the text value and returns it
     *
     * @param   string  $text       Text value of the element
     * @param   string  $selector   CSS selector of the element
     * @return  array 
     */
    protected function checksElementByText( $text, $selector )
    {
        $jsArgs = JsHelper::generateFuncArgs( $text, $selector );
        $jsCode = "return BDD.getElementByText( $jsArgs );";
        return $this->evalJavascript( $jsCode );
    }

    /**
     * Finds an HTML element by class and the text value and return the value of the sibling
     *
     * @param   string  $text       Text value of the element
     * @param   string  $selector   CSS selector of the element
     * @return  array
     */
    protected function checksElementSiblingValue( $text, $selector )
    {
        $jsArgs = JsHelper::generateFuncArgs( $text, $selector );
        $jsCode = "return BDD.checksElementSiblingValueByText( $jsArgs );";
        return $this->evalJavascript( $jsCode );
    }

    /**
     * Explores the content tree, expanding it and click on the desired element
     *
     * @param   string  $dir    The content tree path such as 'Content1/Content2/ContentIWantToClick'
     * @param   int     $index  Path current depth index such as '0 => Content1 2=> Content2'
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
     * @param   string  $path      file path relative to mink definitions
     * @param   string  $selector  selector of the element do to make visible
     */
    protected function attachFilePrepare( $path, $selector )
    {
        $jsArgs = JsHelper::generateFuncArgs( $selector );
        $jsCode = "return BDD.changeCssDisplay( $jsArgs );";
        $this->execJavascript( $jsCode );

        $this->attachFile( $path, $selector );
    }

    /**
     * Attaches a file to a input field en HTML
     *
     * @param   string  $file       file name relative to mink definitions
     * @param   string $selector    CSS file upload element selector
     */
    protected function attachFile( $fileName, $selector )
    {
        if ( $this->getMinkParameter( 'files_path' ) )
        {
            $fullPath = rtrim( realpath( $this->getMinkParameter( 'files_path' ) ), DIRECTORY_SEPARATOR ).DIRECTORY_SEPARATOR.$fileName;

            if ( is_file( $fullPath ) )
            {
                $fileInput = 'input[type="file"]' . $selector;
                $field = $this->getSession()->getPage()->find( 'css', $fileInput );

                if ( null === $field )
                {
                    throw new Exception( "File input $$selector is not found" );
                }
                $field->attachFile( $fullPath );
            }
        }
        else
        {
            throw new Exception( "File $fileName is not found at the given location: $fullPath" );
        }
    }

    /**
     * Drops a file to an HTML element with specific text
     *
     * @param   string  $path      file path relative to mink definitions
     * @param   string  $selector  selector of the element where to drop the file
     */
    protected function dragAndDropFile( $fileName, $selector )
    {
        if ( $this->getMinkParameter( 'files_path' ) )
        {
            $fullPath = rtrim( realpath( $this->getMinkParameter( 'files_path' ) ), DIRECTORY_SEPARATOR ).DIRECTORY_SEPARATOR.$fileName;

            if ( is_file( $fullPath ) )
            {
                $finfo = finfo_open( FILEINFO_MIME_TYPE );
                $fileType = finfo_file( $finfo, $fullPath );
                $contents = file_get_contents( $fullPath );
                $contentBase64 = base64_encode( $contents );

                $jsArgs = JsHelper::generateFuncArgs( $file, $fileType, $contentBase64, $selector );
                $jsCode = "return BDD.simulateDropEventWithFile( $jsArgs );";
                $jsFile = $this->execJavascript( $jsCode );
            }
        }
        else
        {
                throw new Exception( "File $fileName is not found at the given location: $fullPath" );
        }
    }

    /**
     * Finds an Image element with a label
     *
     * @param   string  $imageLabel image label text
     * @param   string  $selector   image css selector
     */
    protected function checksImagePresent( $imageLabel, $selector )
    {
        $jsArgs = JsHelper::generateFuncArgs( $imageLabel, $selector );
        $jsCode = "return BDD.getImgSrc( $jsArgs );";
        return $this->evalJavascript( $jsCode );
    }

    /**
     * Finds an file URL link with a label
     *
     * @param   string  $fileLabel  file label text
     * @param   string  $selector   file css selector 
     */
    protected function getFileUrl( $fileLabel, $selector )
    {
        $jsArgs = JsHelper::generateFuncArgs( $fileLabel, $selector );
        $jsCode = "return BDD.getLinkUrl( $jsArgs );";
        return $this->evalJavascript( $jsCode );
    }

    /**
     * Get the Location Id of the location on the display in the corrent browser window
     *
     * @return string
     */
    protected function getLocationId()
    {
        $jsCode = "return BDD.getWindowHash();";
        $hash = $this->evalJavascript( $jsCode );
        $hash = explode( '/', $hash );
        $lastElement = end( $hash );
        return $lastElement;
    }
}
