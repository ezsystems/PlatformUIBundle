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
use EzSystems\PlatformUIBundle\Features\Context\PlatformUI;
use EzSystems\PlatformBehatBundle\Helper\Xpath;

class BrowserContext extends PlatformUI
{
    /**
     * @var \EzSystems\BehatBundle\Helper\Xpath
     */
    private $xpath;

    /**
     * @BeforeScenario
     */
    public function prepareHelpers()
    {
        // initialize Helpers
        $this->xpath = new Xpath($this->getSession());
    }

    /**
     * Getter for Xpath
     *
     * @return \EzSystems\BehatBundle\Helper\Xpath
     */
    public function getXpath()
    {
        return $this->xpath;
    }

    /**
     * @Given I clicked on/at (the) :link link
     * @When  I click on/at (the) :link link
     *
     * Click a link with text ':link'
     */
    public function clickLink($link)
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
}
