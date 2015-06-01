<?php

/**
 * File containing the Common Functions for context class PlatformUI.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 * @version //autogentag//
 */

namespace EzSystems\PlatformUIBundle\Features\Context\SubContext;

trait CommonActions
{
    /**
     * @Given I click (on) the logo
     * Clicks on the PlatformUI logo
     */
    public function clickLogo()
    {
        $page = $this->getSession()->getPage();
        $selector = '.ez-logo a';
        $page->find('css', $selector)->click();
    }

    /**
     * @Given I click (on) the tab :tab
     * Clicks on a PlatformUI tab
     *
     * @param   string  $tab    Text of the element to click
     */
    public function clickTab($tab)
    {
        $this->clickElementByText($tab, ".ez-tabs-label a[href]");
    }

    /**
     * @Given I click (on) the navigation zone :zone
     * Click on a PlatformUI menu zone
     *
     * @param   string  $zone   Text of the element to click
     */
    public function clickNavigationZone($zone)
    {
        $this->clickElementByText($zone, ".ez-zone-name");
    }

    /**
     * @Given I click on the :button button number :index
     * Click on a PlatformUI button
     *
     * @param  string   $button     Text of the element to click
     * @param  string   $index      WHAT IS THIS?!
     */
    public function clickButtonWithIndex($button, $index)
    {
        $this->clickElementByText($button, "button", $index);
    }

    /**
     * @Given I over (on) the navigation zone :zone
     * Over on a PlatformUI menu zone
     *
     * @param  string   $button     Text of the element to click
     */
    public function overNavigationZone($zone)
    {
        $selector = ".ez-zone-name";
        $jsArgs = JsHelper::generateFuncArgs($zone, $selector);
        $jsCode = "return BDD.mouseOverElementByText( $jsArgs );";
        $this->execJavascript($jsCode);
    }

    /**
     * @Given I click (on) the navigation item :item
     * Click on a PlatformUI sub-menu option
     *
     * @param  string   $item     Text of the element to click
     */
    public function clickNavigationItem($item)
    {
        $this->clickElementByText($item, '.ez-navigation-item');
    }

    /**
     * @Given I click (on) the actionbar action :action
     * Click on a PlatformUI action bar
     *
     * @param  string   $action     Text of the element to click
     */
    public function clickActionBar($action)
    {
        $this->clickElementByText($action, '.ez-action', '.action-label');
    }

    /**
     * @Given I click (on) the content type :contentType
     * Click on a PlatformUI side menu content type
     *
     * @param  string   $contentType     Text of the element to click
     */
    public function clickContentType($contentType)
    {
        $this->clickElementByText($contentType, '.ez-contenttypeselector-types .ez-selection-filter-item ');
    }

    /**
     * @Given I click (on) the content tree with path :path
     * Explores the content tree, expanding it and click on the desired element
     *
     * @param   string  $path    The content tree path such as 'Content1/Content2/ContentIWantToClick'
     */
    public function openTreePath($path)
    {
        $this->clickActionBar("Content tree");
        $this->waitForLoadings();
        $path = explode("/", $path);
        $node = null;
        foreach ($path as $pathNode) {
            $node = $this->openTreeNode($pathNode, $node);
            $this->waitForLoadings();
        }
        $node->find('css', '.ez-tree-navigate')->click();
    }

    /**
     * Opens a content tree node based on the root of the tree or a given node
     *
     * @param   string          $pathNode   The text of the node that is going to be opened
     * @param   NodeElement     $node       The base node that I want to expand from, if null provided defaults to the content tree root
     * @return  NodeElement                 The node that was opened
     */
    private function openTreeNode($pathNode, $node)
    {
        $page = $this->getSession()->getPage();
        $notFound = true;
        if ($node == null) {
            $node = $page->find('css', '.ez-platformui-app-body');
        }
        $subNodes = $node->findAll('css', '.ez-tree-node');
        foreach ($subNodes as $subNode) {
            $leafNode = $subNode->find('css', '.ez-tree-navigate');
            if ($leafNode->getText() == $pathNode) {
                $notFound = false;
                if ($subNode->hasClass('is-tree-node-close')) {
                    $toggleNode = $subNode->find('css', '.ez-tree-node-toggle');
                    if ($toggleNode->isVisible()) {
                        $toggleNode->click();
                    }
                }
                return $subNode;
            }
        }
        if ($notFound) {
            throw new \Exception("The path node: $pathNode was not found for the given path");
        }
        return $node;
    }

    /**
     * Finds an HTML element by class and the text value and clicks it
     *
     * @param string $text Text value of the element
     * @param string $selector CSS selector of the element
     */
    protected function clickElementByText($text, $selector, $textSelector = null, $index = 1)
    {
        $index + 1; //DO NOT FORGET SOMETHING THAT I DON'T REMENBER
        $element = $this->getElementByText($text, $selector, $textSelector);
        if ($element) {
            $element->click();
        } else {
            throw new \Exception("Can't click \" $text \" element: Not Found");
        }
    }

    /**
     * Finds an HTML element by class and the text value and returns it
     *
     * @param string    $text           Text value of the element
     * @param string    $selector       CSS selector of the element
     * @param string    $textSelector   extra CSS selector for text of the element
     * @return array
     */
    protected function getElementByText($text, $selector, $textSelector = null)
    {
        $page = $this->getSession()->getPage();
        $elements = $page->findAll('css', $selector);
        foreach ($elements as $element) {
            if ($textSelector != null) {
                $elementText = $element->find('css', $textSelector)->getText();
            } else {
                $elementText = $element->getText();
            }
            if ($elementText == $text) {
                return $element;
            }
        }
        return false;
    }
}
