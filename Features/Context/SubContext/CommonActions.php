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
     * @Given I click (on) the logo
     * Clicks on the PlatformUI logo
     */
    public function clickLogo()
    {
        $selector = '.ez-logo a';
        $jsArg = JsHelper::generateFuncArgs( $selector );
        $jsCode = "return BDD.clickElement( $jsArg );";
        $this->execJavascript( $jsCode );
    }

    /**
     * @Given I click (on) the tab :tab
     * Clicks on a PlatformUI tab
     */
    public function clickTab( $tab )
    {
        $this->clickElementByText( $tab, ".ez-tabs-label a[href]" );
    }

    /**
     * @Given I click (on) the navigation zone :zone
     * Click on a PlatformUI menu zone
     */
    public function clickNavigationZone( $zone )
    {
        $this->clickElementByText( $zone, ".ez-zone-name" );
    }

    /**
     * @Given I over (on) the navigation zone :zone
     * Over on a PlatformUI menu zone
     */
    public function overNavigationZone( $zone )
    {
        $selector = ".ez-zone-name";
        $jsArgs = JsHelper::generateFuncArgs( $zone, $selector );
        $jsCode = "return BDD.mouseOverElementByText( $jsArgs );";
        $this->execJavascript( $jsCode );
    }

    /**
     * @Given I click (on) the navigation item :item
     * Click on a PlatformUI sub-menu option
     */
    public function clickNavigationItem( $item )
    {
        $this->clickElementByText( $item, '.ez-navigation-item' );
    }

    /**
     * @Given I click (on) the actionbar action :action
     * Click on a PlatformUI action bar
     */
    public function clickActionBar( $action )
    {
        $this->clickElementByText( $action, '.ez-action' );
    }

    /**
     * @Given I click (on) the content type :contentType
     * Click on a PlatformUI side menu content type
     */
    public function clickContentType( $contentType )
    {
        $this->clickElementByText( $contentType, '.ez-contenttypeselector-types .ez-selection-filter-item ' );
    }

    /**
     * @Given I click (on) the content tree with path :path
     * Explores the content tree, expanding it and click on the desired element
     *
     * @param   string  $dir    The content tree path such as 'Content1/Content2/ContentIWantToClick'
     * @param   int     $index  Path current depth index such as '0 => Content1 2=> Content2'
     */
    public function clickContentTreeLink( $path, $index = 0, $rootSelectorId = '' )
    {
        $path = explode( "/", $path );

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
    * Finds an HTML element by class and the text value and clicks it
    *
    * @param string $text Text value of the element
    * @param string $selector CSS selector of the element
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
    * @param string $text Text value of the element
    * @param string $selector CSS selector of the element
    * @return array
    */
    protected function checksElementByText( $text, $selector )
    {
        $jsArgs = JsHelper::generateFuncArgs( $text, $selector );
        $jsCode = "return BDD.getElementByText( $jsArgs );";
        return $this->evalJavascript( $jsCode );
    }
}
