<?php

/**
 * File containing the Fields Functions for context class PlatformUI.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 * @version //autogentag//
 */
namespace EzSystems\PlatformUIBundle\Features\Context;

use EzSystems\BehatBundle\ObjectManager\FieldType;
use Behat\Mink\WebAssert;

class Fields extends PlatformUI
{
    const NOTIFICATION_CONTENT_PUBLISHED = 'Content has been published';
    const NOTIFICATION_PUBLISH_ERROR = 'An error occured while publishing the draft';

    protected function getFieldIdentCss($identifier, $contentId = '')
    {
        return "ez-field-$contentId-$identifier";
    }

    protected function getEditInputCss($type, $fieldIdentifier = '', $contentId = '')
    {
        if (empty($fieldIdentifier) && empty($contentId)) {
            $inputSelector = 'input';
        } else {
            $ident = $this->getFieldIdentCss($fieldIdentifier, $contentId);
            $inputSelector = "input[id='$ident']";
        }

        return "ez-view-${type}editview > .ez-editfield-row .ez-editfield-input > .ez-$type-input-ui > $inputSelector";
    }

    protected function getEditLabelCss($type, $fieldIdentifier = '', $contentId = '')
    {
        if (empty($fieldIdentifier) && empty($contentId)) {
            $labelSelector = 'label';
        } else {
            $ident = $this->getFieldIdentCss($fieldIdentifier, $contentId);
            $labelSelector = "label[for='$ident']";
        }

        // ez-view-contenteditview for create, ez-view-contenteditformview for edit...
        return ".ez-view-${type}editview > .ez-editfield-row > .ez-editfield-infos $labelSelector > .ez-fielddefinition-name";
    }

    protected function getThisFieldIdent()
    {
        $fieldManager = $this->getFieldTypeManager();
        $identifier = $fieldManager->getThisFieldTypeIdentifier();

        // check if we are editing a field for draft or published content
        if ($fieldManager->getFieldContentState() == FieldType::CONTENT_PUBLISHED) {
            $contentId = $fieldManager->getThisContentId();
        } else {
            $contentId = '';
        }

        return $this->getFieldIdentCss($identifier, $contentId);
    }

    /**
     * @When I create a content of this type
     */
    public function createAContentOfThisType()
    {
        $fieldManager = $this->getFieldTypeManager();
        $fieldManager->setFieldContentState(FieldType::CONTENT_TYPE_PUBLISHED);
        $name = $fieldManager->getThisContentTypeName();

        $this->clickNavigationZone('Content');
        $this->clickNavigationItem('Content structure');
        $this->clickActionBar('Create');
        $this->clickContentType($name);
        $this->platformStatus = self::WAITING_FOR_PUBLISHING;
    }

    /**
     * @When I edit this content
     */
    public function editThisContent()
    {
        $fieldManager = $this->getFieldTypeManager();
        $fieldManager->setFieldContentState(FieldType::CONTENT_PUBLISHED);
        $name = $fieldManager->getThisContentName();

        $this->clickNavigationZone('Content');
        $this->clickNavigationItem('Content structure');
        $this->clickOnBrowsePath($name);
        $this->confirmSelection();
        $this->clickActionBar('Edit');
        $this->platformStatus = self::WAITING_FOR_PUBLISHING;
        // assert
        $this->iSeeContentEditView();
    }

    /**
     * @When I set :value as the Field Value
     * @And I set :value as the Field Value
     */
    public function setFieldValue($value)
    {
        $this->fillFieldWithValue($this->getThisFieldIdent(), $value);
    }

    /**
     *  @Given I set an/a empty value as the Field Value
     *  @And I set an/a empty value as the Field Value
     */
    public function setFieldValueToNothing()
    {
        $this->setFieldValue('');
    }

    /**
     * @When I check the Field Value
     * @And I check the Field Value
     */
    public function checkFieldValue()
    {
        if ($this->platformStatus == self::WAITING_FOR_PUBLISHING) {
            $this->checkOption($this->getThisFieldIdent());
        } else {
            throw new \Exception('Cannot publish content, application in wrong state');
        }
    }

    /**
     * @When I uncheck the Field Value
     * @And I uncheck the Field Value
     */
    public function uncheckFieldValue()
    {
        if ($this->platformStatus == self::WAITING_FOR_PUBLISHING) {
            $this->uncheckOption($this->getThisFieldIdent());
        } else {
            throw new \Exception('Cannot publish content, application in wrong state');
        }
    }

    /**
     * @When I publish the content
     * @And I publish the content
     */
    public function publishContent()
    {
        if ($this->platformStatus == self::WAITING_FOR_PUBLISHING) {
            $this->clickEditActionBar('Publish');
        } else {
            throw new \Exception('Cannot publish content, application in wrong state');
        }
    }

    /**
     * @Then the :label field should be marked as required
     *
     * Checks to see if the field is marked as required when editing.
     */
    public function seeRequiredFieldtOfType($label)
    {
        if ($this->platformStatus == self::WAITING_FOR_PUBLISHING) {
            $fieldManager = $this->getFieldTypeManager();
            // $type = ...
            //$name = $fieldManager->getThisFieldTypeName();

            $verification = new WebAssert($this->getSession());
            //$verification->elementTextContains('css', $this->getEditLabelCss($type, $name), $label . '*');.
            $verification->elementTextContains('css', '.ez-fielddefinition-name', $label . '*');
        } else {
            throw new \Exception('Cannot publish content, application in wrong state');
        }
    }

    /**
     * @Then I see the content edit view/form
     */
    public function iSeeContentEditView()
    {
        $verification = new WebAssert($this->getSession());
        $verification->elementExists('css', '.ez-view-contenteditformview');
    }

    /**
     * @Then the Content is successfully published
     */
    public function contentIsPublished()
    {
        $this->iSeeNotification(self::NOTIFICATION_CONTENT_PUBLISHED);
    }

    /**
     * @Then Publishing fails with validation error message :messege
     */
    public function failsWithMessage($message)
    {
        $verification = new WebAssert($this->getSession());
        $verification->elementTextContains('css', '.ez-editfield-error-message', $message);
    }

    /**
     * @Then I should see an/a :type field
     * @Then I should see an/a :label label related with the :type field
     */
    public function seeFieldtOfType($type, $label = null)
    {
        if ($this->platformStatus == self::WAITING_FOR_PUBLISHING) {
            $this->clickEditActionBar('Publish');
        }
        $verification = new WebAssert($this->getSession());
        // for view we need the internal field identifier...
        $internalName = $this->getFieldTypeManager()->getFieldTypeInternalIdentifier($type);
        $verification->elementExists('css', ".ez-fieldview-$internalName .ez-fieldview-value-content");

        if ($label != null) {
            $verification->elementTextContains('css', ".ez-fieldview-$internalName .ez-fieldview-name", $label);
        }
    }

    /**
     * @When I view this Content
     */
    public function viewThisContent()
    {
        $fieldManager = $this->getFieldTypeManager();
        $fieldManager->setFieldContentState(FieldType::CONTENT_PUBLISHED);
        $name = $fieldManager->getThisContentName();

        $this->clickNavigationZone('Content');
        $this->clickNavigationItem('Content structure');
        $this->clickOnBrowsePath($name);
        $this->confirmSelection();
    }

    /**
     * @Then I should see an/a field with value :value
     */
    public function seeFieldtWithValue($value)
    {
        if ($this->platformStatus == self::WAITING_FOR_PUBLISHING) {
            $this->clickEditActionBar('Publish');
        }
        $verification = new WebAssert($this->getSession());
        $verification->elementTextContains('css', '.ez-fieldview-value-content', $value);
    }
}
