<?php

/**
 * File containing the Common Functions for context class PlatformUI.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 * @version //autogentag//
 */
namespace EzSystems\PlatformUIBundle\Features\Context\SubContext;

use PHPUnit_Framework_Assert as Assertion;
use Behat\Behat\Hook\Scope\BeforeScenarioScope;
use EzSystems\PlatformUIBundle\Features\Context\PlatformUI;

class ContentEditContext extends PlatformUI
{
    /**
     */
    private $basicContentContext;
    private $dashboardContext;
    private $browserContext;

    /**
     * @BeforeScenario
     */
    public function gatherContexts(BeforeScenarioScope $scope)
    {
        $this->basicContentContext = $scope->getEnvironment()->getContext(
            'EzSystems\PlatformBehatBundle\Context\Object\BasicContentContext'
        );
        $this->dashboardContext = $scope->getEnvironment()->getContext(
            'EzSystems\PlatformUIBundle\Features\Context\SubContext\DashboardContext'
        );
        $this->browserContext = $scope->getEnvironment()->getContext(
            'EzSystems\PlatformUIBundle\Features\Context\SubContext\BrowserContext'
        );
    }

    /**
     * @Given I create a content of content type :type with:
     */
    public function iCreateContentType($type, TableNode $fields)
    {
        $this->dashboardContext->clickNavigationZone('Platform');
        $this->dashboardContext->clickLink('Content structure');
        $this->dashboardContext->clickActionBar('Create a content');
        $this->dashboardContext->clickContentType($type);
        foreach ($fields as $fieldArray) {
            $keys = array_keys($fieldArray);
            for ($i = 0; $i < count($keys); ++$i) {
                $this->browserContext->fillFieldWithValue($keys[$i], $fieldArray[$keys[$i]]);
            }
        }
    }

     /**
     * @Given I am on :name full view
     */
    public function onFullView($name)
    {
        $path = $this->basicContentContext->getContentPath($name);
        $this->goToContentWithPath($path);
    }

    /**
     * Opens a content in PlatformUi.
     */
    private function goToContentWithPath($path)
    {
        $this->dashboardContext->clickNavigationZone('Content');
        $this->dashboardContext->clickNavigationItem('Content structure');
        $this->waitWhileLoading();
        $this->dashboardContext->clickOnTreePath($path);
    }

    /**
     * @Then I am on the :name location view
     */
    public function onLocationView($name)
    {
        // little info about content in platformUI,
        // for now only verifies if the title matches
        $this->waitWhileLoading();
        $this->browserContext->iSeeTitle($name);
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
}
