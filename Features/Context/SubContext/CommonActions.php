<?php

/**
 * File containing the Common Functions for context class PlatformUI.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 * @version //autogentag//
 */
namespace EzSystems\PlatformUIBundle\Features\Context\SubContext;

use WebDriver\Exception\StaleElementReference;

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
        $this->clickElementByText($tab, '.ez-tabs-label a[href]');
    }

    /**
     * @Given I click (on) the navigation zone :zone
     * Click on a PlatformUI menu zone
     *
     * @param   string  $zone   Text of the element to click
     */
    public function clickNavigationZone($zone)
    {
        $this->clickElementByText($zone, '.ez-zone-name');
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
        $this->clickElementByText($button, 'button', $index);
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
     * @Given I click (on) the discovery bar button :button
     * Click on a PlatformUI discovery bar
     *
     * @param  string   $button     Text of the element to click
     */
    public function clickDiscoveryBar($button)
    {
        $this->clickElementByText($button, '.ez-view-discoverybarview .ez-action', '.action-label');
    }

    /**
     * @Given I click (on) the action bar button :button
     * Click on a PlatformUI action bar
     *
     * @param  string   $button     Text of the element to click
     */
    public function clickActionBar($button)
    {
        $this->clickElementByText($button, '.ez-actionbar-container .ez-action', '.action-label');
    }

    /**
     * @Given I click (on) the edit action bar button :button
     * Click on a PlatformUI edit action bar
     *
     * @param  string   $button     Text of the element to click
     */
    public function clickEditActionBar($button)
    {
        $this->clickElementByText($button, '.ez-editactionbar-container .ez-action', '.action-label');
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
     * Explores the content tree, expanding it and click on the desired element.
     *
     * @param   string  $path    The content tree path such as 'Content1/Content2/ContentIWantToClick'
     */
    public function openTreePath($path, $node)
    {
        $path = explode('/', $path);
        foreach ($path as $pathNode) {
            $node = $this->openTreeNode($pathNode, $node);
            $this->waitForLoadings();
        }
        $node->find('css', '.ez-tree-navigate')->click();
    }

    /**
     * Opens a content tree node based on the root of the tree or a given node.
     *
     * @param   string          $pathNode   The text of the node that is going to be opened
     * @param   NodeElement     $node       The base node to expand from, if null defaults to the content tree root
     * @return  NodeElement                 The node that was opened
     */
    protected function openTreeNode($pathNode, $node)
    {
        $page = $this->getSession()->getPage();
        $notFound = true;
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
     * Finds an HTML element by class and the text value and clicks it.
     *
     * @param string    $text           Text value of the element
     * @param string    $selector       CSS selector of the element
     * @param string    $textSelector   Extra CSS selector for text of the element
     * @param string    $baseElement    Element in which the search is based
     */
    protected function clickElementByText($text, $selector, $textSelector = null, $baseElement = null, $index = 1)
    {
        $index + 1; //for selection of equal buttons
        $element = $this->getElementByText($text, $selector, $textSelector, $baseElement);
        if ($element) {
            $element->click();
        } else {
            throw new \Exception("Can't click \" $text \" element: Not Found");
        }
    }

    /**
     * Finds an HTML element by class and the text value and returns it.
     *
     * @param string    $text           Text value of the element
     * @param string    $selector       CSS selector of the element
     * @param string    $textSelector   Extra CSS selector for text of the element
     * @param string    $baseElement    Element in which the search is based
     * @param int       $iteration      Iteration number, used to control number of executions
     * @return array
     */
    protected function getElementByText($text, $selector, $textSelector = null, $baseElement = null, $iteration = 3)
    {
        try {
            if ($baseElement == null) {
                $baseElement = $this->getSession()->getPage();
            }
            $elements = $baseElement->findAll('css', $selector);
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
        } catch (StaleElementReference $e) {
            // In case of the element changes, the reference becames stale
            // re-run this method up to 3 times to account for this
            if ($iteration > 0) {
                usleep(5 * 1000); // 5ms
                return $this->getElementByText($text, $selector, $textSelector, null, $iteration--);
            } else {
                throw new \Exception('Stale reference occured more than 3 times in a row, possible infinite loop');
            }
        }
    }
}
