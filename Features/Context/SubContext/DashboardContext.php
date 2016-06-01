<?php

/**
 * File containing the Common Functions for context class PlatformUI.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 * @version //autogentag//
 */
namespace EzSystems\PlatformUIBundle\Features\Context\SubContext;

use EzSystems\PlatformUIBundle\Features\Context\PlatformUI;

class DashboardContext extends PlatformUI
{
    /**
     * @Given I click (on) the logo
     * Clicks on the PlatformUI logo.
     */
    public function clickLogo()
    {
        $page = $this->getSession()->getPage();
        $selector = '.ez-logo a';
        $page->find('css', $selector)->click();
    }

    /**
     * @Given I click (on) the navigation zone :zone
     * Click on a PlatformUI menu zone.
     *
     * @param   string  $zone   Text of the element to click
     */
    public function clickNavigationZone($zone)
    {
        $this->clickElementByText($zone, '.ez-zone-name');
        $this->waitWhileLoading();
        // Clicking navigation zone triggers load of first item,
        // we must wait before interacting with the page (see EZP-25128)
        // this method sleeps for a default amount (see EzSystems\PlatformUIBundle\Features\Context\PlaformUI)
        $this->sleep();
    }

    /**
     * @Given I click (on) the navigation item :item
     * Click on a PlatformUI sub-menu option.
     *
     * @param  string   $item     Text of the element to click
     */
    public function clickNavigationItem($item)
    {
        $this->clickElementByText($item, '.ez-navigation-item');
        $this->waitWhileLoading();
    }

    /**
     * @Given I click (on) the discovery bar button :button
     * Click on a PlatformUI discovery bar.
     *
     * @param  string   $button     Text of the element to click
     */
    public function clickDiscoveryBar($button)
    {
        $this->clickElementByText($button, '.ez-view-discoverybarview .ez-action', '.action-label');
        $this->waitWhileLoading();
    }

    /**
     * @Given I click (on) the action bar button :button
     * Click on a PlatformUI action bar.
     *
     * @param  string   $button     Text of the element to click
     */
    public function clickActionBar($button)
    {
        $this->clickElementByText($button, '.ez-actionbar-container .ez-action', '.action-label');
        $this->waitWhileLoading();
    }

    /**
     * @Given I click (on) the edit action bar button :button
     * Click on a PlatformUI edit action bar.
     *
     * @param  string   $button     Text of the element to click
     */
    public function clickEditActionBar($button)
    {
        $this->clickElementByText($button, '.ez-editactionbar-container .ez-action', '.action-label');
        $this->waitWhileLoading();
    }

    /**
     * @Given I click (on) the content tree with path :path
     * @Then I see :path in the content tree
     * Explores the content tree, expanding it and click on the desired element.
     *
     * @param   string  $path    The content tree path such as 'Content1/Content2/ContentIWantToClick'
     */
    public function clickOnTreePath($path)
    {
        $node = $this->findWithWait('.ez-view-discoverybarview');
        $this->clickDiscoveryBar('Content tree');
        $this->openTreePath($path, $node);
    }

    /**
     * @Given I click (on) the content type :contentType
     * Click on a PlatformUI side menu content type.
     *
     * @param  string   $contentType     Text of the element to click
     */
    public function clickContentType($contentType)
    {
        $this->clickElementByText($contentType, '.ez-contenttypeselector-types .ez-selection-filter-item ');
        $this->waitWhileLoading();
    }

    /**
     * @Then I don't see :path in the content tree
     * @Then I do not see :path in the content tree
     * Explores the content tree, expanding it and click on the desired element.
     *
     * @param   string  $path    The content tree path such as 'Content1/Content2/ContentIWantToClick'
     */
    public function dontSeeTreePath($path)
    {
        $found = true;
        try {
            $this->clickOnTreePath($path);
        } catch (\Exception $e) {
            $found = false;
        }

        if ($found) {
            throw new \Exception("Tree path '$path' was found");
        }

        return true;
    }

    /**
     * @When I select the :path folder in the Universal Discovery Widget
     */
    public function selectFromUniversalDiscovery($path)
    {
        // wait wihile UDW is hidden...
        $this->waitWhileLoading('.is-universaldiscovery-hidden');
        $node = $this->findWithWait('.ez-view-universaldiscoveryview');
        $node = $this->findWithWait('.ez-view-universaldiscoverybrowseview .ez-ud-browse-tree', $node);
        $this->openTreePath($path, $node);
    }

    /**
     * @When I confirm the selection
     * Confirm selection in Universal descovery.
     */
    public function confirmSelection()
    {
        $this->clickElementByText('Confirm selection', '.ez-universaldiscovery-confirm');
    }

    /**
     * @Then I am notified that :message
     */
    public function iSeeNotification($message)
    {
        $this->sleep();
        $result = $this->getElementByText($message, '.ez-notification-text');
        if (!$result) {
            throw new \Exception("The notification with message '$message' was not shown");
        }
    }

    /**
     * @Then I am not notified that :message
     */
    public function iDoNotSeeNotification($message)
    {
        try {
            $this->iSeeNotification($message);
        } catch (\Exception $e) {
            return;
        }
        throw new \Exception("Unexpected notification shown with message '$message'");
    }

    /**
     * @Then I should be on the dashboard
     */
    public function iShouldBeOnTheDashboard()
    {
        $this->assertSession()->elementExists('css', '.ez-view-dashboardview');
    }

    /**
     * @Given I am redirected to a location view
     */
    public function iHaveBeenRedirectedToALocationView()
    {
        $this->assertSession()->elementExists('css', '.ez-mainviews .ez-view-locationviewview');
    }
}
