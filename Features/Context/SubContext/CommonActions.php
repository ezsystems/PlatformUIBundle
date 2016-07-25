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
use Exception;

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
         // @TODO implement click on link without get by text
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
        // @TODO implement click on link without get by text
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
                    throw new Exception('Field not found');
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
                    throw new Exception('Failed to set the field value: ' . $check);
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
                throw new Exception("Title '$title' not found");
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
            throw new Exception("Field '$label' not found");
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
        // @TODO implement without get by text
    }

    /**
     * @Given I click (on) the navigation zone :zone
     * Click on a PlatformUI menu zone
     *
     * @param   string  $zone   Text of the element to click
     */
    public function clickNavigationZone($zone)
    {
        $dataNavigation = [
            'Content' => 'platform',
            'Page' => 'studio',
            'Performance' => 'studioplus',
            'Admin Panel' => 'admin',
        ];

        if (!isset($dataNavigation[$zone])) {
            throw new Exception("Navigation zone $zone does not exist");
        }

        $dataNavigationValue = $dataNavigation[$zone];
        $navigationZoneElement = $this->findWithWait(".ez-zone[data-navigation='$dataNavigationValue']");
        $navigationZoneElement->click();
        $this->waitWhileLoading();
        // Clicking navigation zone triggers load of first item,
        // we must wait before interacting with the page (see EZP-25128)
        // this method sleeps for a default amount (see EzSystems\PlatformUIBundle\Features\Context\PlaformUI)
        $this->sleep();
    }

    /**
     * @Given I click (on) the navigation item :item
     * Click on a PlatformUI sub-menu option
     *
     * @param  string   $item     Text of the element to click
     */
    public function clickNavigationItem($item)
    {
        $dataNavigationIdentifier = [
            'Content structure' => 'content-structure',
            'Media library' => 'media-library',
            'Administration dashboard' => 'admin-dashboard',
            'System information' => 'admin-systeminfo',
            'Sections' => 'admin-sections',
            'Content types' => 'admin-contenttypes',
            'Languages' => 'admin-languages',
            'Users' => 'admin-users',
            'Roles' => 'admin-roles',

        ];

        $item = $dataNavigationIdentifier[$item];
        $navigationZoneElement = $this->findWithWait(
            ".ez-view-navigationitemview[data-navigation-item-identifier='$item'] .ez-navigation-item"
        );
        $navigationZoneElement->click();
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
        $dataAction = [
            'Minimize' => 'minimizeDiscoveryBar',
            'Content tree' => 'tree',
            'Trash' => 'viewTrash',
        ];

        if (!isset($dataAction[$button])) {
            throw new Exception("Discovery bar button $button does not exist");
        }

        $button = $dataAction[$button];
        $buttonElement = $this->findWithWait(".ez-view-discoverybarview .ez-action[data-action='$button']");
        $this->waitWhileLoading();
        $buttonElement->click();
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
        $dataAction = [
            'Minimize' => 'minimizeActionBar',
            'Create' => 'createContent',
            'Edit' => 'edit',
            'Move' => 'move',
            'Copy' => 'copy',
            'Send to Trash' => 'sendToTrash',
        ];

        if (!isset($dataAction[$button])) {
            throw new Exception("Action bar button $button does not exist");
        }

        $button = $dataAction[$button];
        $buttonElement = $this->findWithWait(".ez-actionbar-container .ez-action[data-action='$button']");
        $buttonElement->click();
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
        $dataAction = [
            'Publish' => 'publish',
            'Save' => 'save',
            'Discard changes' => 'discard',
        ];

        if (!isset($dataAction[$button])) {
            throw new Exception("Edit Action bar button $button does not exist");
        }

        $button = $dataAction[$button];
        $buttonElement = $this->findWithWait(".ez-editactionbar-container .ez-action[data-action='$button']");
        $buttonElement->click();
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
        $this->waitWhileLoading();
    }

    /**
     * @Given I click (on) the content type :contentType
     * Click on a PlatformUI side menu content type
     *
     * @param  string   $contentType     Text of the element to click
     */
    public function clickContentType($contentType)
    {
        $contentTypeElement = $this->findWithWait(
            ".ez-contenttypeselector-types .ez-selection-filter-item[data-text='$contentType']"
        );
        $contentTypeElement->click();
        //$this->clickElementByText($contentType, '.ez-contenttypeselector-types .ez-selection-filter-item');
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
        $confirmElement = $this->findWithWait('.ez-universaldiscovery-confirm');
        $confirmElement->click();
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
        } catch (Exception $e) {
            $found = false;
        }

        if ($found) {
            throw new Exception("Tree path '$path' was found");
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
        // @TODO check notification content
        $result = $this->findWithWait('.ez-notification-text');
        if (!$result) {
            throw new Exception("The notification with message '$message' was not shown");
        }
    }

    /**
     * @Then I am not notified that :message
     */
    public function iDoNotSeeNotification($message)
    {
        try {
            $this->iSeeNotification($message);
        } catch (Exception $e) {
            return;
        }
        throw new Exception("Unexpected notification shown with message '$message'");
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
            // @TODO implement without get by text
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
        $this->assertSession()->elementExists('css', '.ez-view-dashboardblocksview');
    }

    /**
     * @Given /^I am redirected to a location view$/
     */
    public function iHaveBeenRedirectedToALocationView()
    {
        $this->assertSession()->elementExists('css', '.ez-mainviews .ez-view-locationviewview');
    }
}
