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
        $this->waitWhileLoading();
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
        $this->waitWhileLoading();
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
        $this->waitWhileLoading();
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
        $this->waitWhileLoading();
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
        $this->waitWhileLoading();
    }

    /**
     * @Given I click (on) the content tree with path :path
     * @Then I see :path in the content tree
     * Explores the content tree, expanding it and click on the desired element
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
     * Click on a PlatformUI side menu content type
     *
     * @param  string   $contentType     Text of the element to click
     */
    public function clickContentType($contentType)
    {
        $this->clickElementByText($contentType, '.ez-contenttypeselector-types .ez-selection-filter-item ');
        $this->waitWhileLoading();
    }

    /**
     * @Given I create a content of content type :type with:
     */
    public function iCreateContentType($type, TableNode $fields)
    {
        $this->clickNavigationZone('Platform');
        $this->iClickAtLink('Content structure');
        $this->clickActionBar('Create a content');
        $this->clickContentType($type);
        foreach ($fields as $fieldArray) {
            $keys = array_keys($fieldArray);
            for ($i = 0; $i < count($keys); ++$i) {
                $this->fillFieldWithValue($keys[$i], $fieldArray[$keys[$i]]);
            }
        }
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
     * @Given I am on :name full view
     */
    public function onFullView($name)
    {
        $path = $this->getBasicContentManager()->getContentPath($name);
        $this->goToContentWithPath($path);
    }

    /**
     * Opens a content in PlatformUi.
     */
    private function goToContentWithPath($path)
    {
        $this->clickNavigationZone('Content');
        $this->clickNavigationItem('Content structure');
        $this->clickOnTreePath($path);
    }

    /**
     * @Then I am on the :name location view
     */
    public function onLocationView($name)
    {
        // little info about content in platformUI,
        // for now only verifies if the title matches
        $this->waitWhileLoading();
        $this->iSeeTitle($name);
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
     * @Then I see Content :contentName of type :contentType
     */
    public function contentExists($contentName, $contentType)
    {
        $contentId = $this->getLocationId();
        $content = $this->getContentManager()->loadContentWithLocationId($contentId);
        $contentInfo = $content->contentInfo;
        $contentTypeName = $this->getContentManager()->getContentType($content);
        Assertion::assertEquals($contentName, $contentInfo->name, 'Content has wrong name');
        Assertion::assertEquals($contentType, $contentTypeName, 'Content has wrong type');
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
     * @Then I should see elements with the following names:
     */
    public function iSeeElements(TableNode $elements)
    {
        foreach ($elements as $element) {
            $found = false;
            $name = array_values($element)[0];
            $found = $this->getElementByText($name, '.ez-selection-filter-item');
            Assertion::assertNotNull($found, "Element: $name not found");
        }
    }

    /**
     * @Then I should see (an) element :element with (an) file :file
     */
    public function iSeeElementFile($element, $file)
    {
        $url = $this->getFileUrl($element, '.ez-fieldview-label');
        $fileContentActual = file_get_contents($url);
        $file = rtrim(
            realpath($this->getMinkParameter('files_path')),
            DIRECTORY_SEPARATOR
        ) . DIRECTORY_SEPARATOR . $file;
        $fileContentExpected = file_get_contents($file);
        Assertion::assertEquals($fileContentActual, $fileContentExpected);
    }

    /**
     * @Then /^I should be on the dashboard$/
     */
    public function iShouldBeOnTheDashboard()
    {
        $this->assertSession()->elementExists('css', '.ez-view-dashboardview');
    }

    /**
     * @Given /^I am redirected to a location view$/
     */
    public function iHaveBeenRedirectedToALocationView()
    {
        $this->assertSession()->elementExists('css', '.ez-mainviews .ez-view-locationviewview');
    }
}
