<?php

/**
 * File containing the Common Functions for context class PlatformUI.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 * @version //autogentag//
 */
namespace EzSystems\PlatformUIBundle\Features\Context\SubContext;

use EzSystems\BehatBundle\Helper\EzAssertion;

trait CommonActions
{
    /**
     * @Given I clicked on/at (the) :link link
     * @When  I click on/at (the) :link link
     *
     * Click a link with text ':link'
     */
    public function iClickAtLink($link)
    {
        $this->clickElementByText($link, 'a');
    }

    /**
     * @Given I clicked on/at (the) :button button
     * @When I click on/at (the) :button button
     *
     * Clicks the button identified by ':button'
     */
    public function iClickAtButton($button)
    {
        $this->clickElementByText($button, 'button');
    }

    /**
     * @When I fill in :field with :value
     * @When I set :field as empty
     *
     * Spin function make it possible to retry in case of failure
     */
    public function fillFieldWithValue($field, $value = '')
    {
        $fieldNode = $this->spin(
            function () use ($field) {
                $fieldNode = $this->getSession()->getPage()->findField($field);
                if ($fieldNode == null) {
                    throw new \Exception('Field not found');
                }

                return $fieldNode;
            }
        );

        $this->spin(
            function () use ($fieldNode, $field, $value) {
                // make sure any autofocus elements don't mis-behave when setting value
                $fieldNode->blur();
                usleep(10 * 1000);
                $fieldNode->focus();
                usleep(10 * 1000);

                // setting value on pre-filled inputs can cause issues, clearing before
                $fieldNode->setValue('');
                $fieldNode->setValue($value);

                // verication that the field was really filled in correctly
                $this->sleep();
                $check = $this->getSession()->getPage()->findField($field)->getValue();
                if ($check != $value) {
                    throw new \Exception('Failed to set the field value: ' . $check);
                }

                return true;
            }
        );
    }

    /**
     * @Then I (should) see :title title/topic
     */
    public function iSeeTitle($title)
    {
        $page = $this->getSession()->getPage();
        $this->spin(
            function () use ($title, $page) {
                $titleElements = $page->findAll('css', 'h1, h2, h3');
                foreach ($titleElements as $titleElement) {
                    $elementText = $titleElement->getText();
                    if ($elementText == $title) {
                        return $titleElement;
                    }
                }
                throw new \Exception("Title '$title' not found");
            }
        );
    }

    /**
     * @Then I should see a :label input field
     */
    public function seeInputField($label)
    {
        $field = $this->getSession()->getPage()->findField($label);
        if (!$field) {
            throw new \Exception("Field '$label' not found");
        }
    }

    /**
     * @Given I checked :label checkbox
     * @When  I check :label checkbox
     *
     * Toggles the value for the checkbox with name ':label'
     */
    public function checkOption($option)
    {
        $fieldElements = $this->getXpath()->findFields($option);
        EzAssertion::assertElementFound($option, $fieldElements, null, 'checkbox');

        // this is needed for the cases where are checkboxes and radio's
        // side by side, for main option the radio and the extra being the
        // checkboxes values
        if (strtolower($fieldElements[0]->getAttribute('type')) !== 'checkbox') {
            $value = $fieldElements[0]->getAttribute('value');
            $fieldElements = $this->getXpath()->findXpath("//input[@type='checkbox' and @value='$value']");
            EzAssertion::assertElementFound($value, $fieldElements, null, 'checkbox');
        }

        $fieldElements[0]->check();
    }

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
        // Clicking navigation zone triggers load of first item,
        // we must wait before interacting with the page (see EZP-25128)
        // this method sleeps for a default amount (see EzSystems\PlatformUIBundle\Features\Context\PlaformUI)
        $this->sleep();
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
     * @Then :path content item does not exists
     * @Then :path content item doesn't exists
     * @Then the content item :path was removed
     * @Then the content item :path was sent to trash
     * Explores the finder of the UDW, verify the desired element doesn't exist and close the UDW.
     *
     * @param string $path The content browse path such as 'Content1/Content2/ContentIWantToClick'
     */
    public function thereIsNoContent($path)
    {
        $this->clickNavigationItem('Content structure');
        $this->dontSeeBrowsePath($path);
        $this->cancelSelection();
    }

    /**
     * @Then :path content item exists
     * @Then the content item :path was not removed
     * @Then the content item :path was not sent to trash
     * @Then the content item was moved to :path
     * @Then the content item was copied to :path
     * Explores the finder of the UDW, find the desired element and close the UDW.
     *
     * @param string $path The content browse path such as 'Content1/Content2/ContentIWantToClick'
     */
    public function thereIsAContent($path)
    {
        $this->clickNavigationItem('Content structure');
        $this->clickOnBrowsePath($path);
        $this->confirmSelection();
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
        // wait while UDW is hidden...
        $this->waitWhileLoading('.is-universaldiscovery-hidden');
        $node = $this->findWithWait('.ez-view-universaldiscoveryview');
        $node = $this->findWithWait('.ez-view-universaldiscoveryfinderview .ez-ud-finder-explorerlevel', $node);
        $this->openFinderExplorerPath($path, $node);
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
    public function goToContentWithPath($path)
    {
        $this->clickNavigationZone('Content');
        $this->clickNavigationItem('Content structure');
        $this->clickOnBrowsePath($path);
        $this->confirmSelection();
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
        $this->waitWhileLoading();
        $this->findWithWait('.ez-dashboard-content');
    }

    /**
     * @Given /^I am redirected to a location view$/
     */
    public function iHaveBeenRedirectedToALocationView()
    {
        $this->assertSession()->elementExists('css', '.ez-mainviews .ez-view-locationviewview');
    }
}
