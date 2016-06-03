<?php

/**
 * File containing the Fields Functions for context class PlatformUI.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 * @version //autogentag//
 */
namespace EzSystems\PlatformUIBundle\Features\Context;

use Behat\Mink\WebAssert;
use EzSystems\PlatformBehatBundle\Context\Object\FieldTypeContext as FieldType;

class Fields extends PlatformUI
{
    const NOTIFICATION_CONTENT_PUBLISHED = 'Content has been published';
    const NOTIFICATION_PUBLISH_ERROR = 'An error occured while publishing the draft';

    /**
     * @var EzSystems\PlatformBehatBundle\Context\Object\FieldTypeContext
     */
    protected $fieldtypeContext;

    /**
     * @var EzSystems\PlatformUIBundle\Features\Context\SubContext\DashboardContext
     */
    protected $dashboardContext;

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
        $identifier = $this->fieldtypeContext->getThisFieldTypeIdentifier();

        // check if we are editing a field for draft or published content
        if ($this->fieldtypeContext->getFieldContentState() == FieldType::CONTENT_PUBLISHED) {
            $contentId = $this->fieldtypeContext->getThisContentId();
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
        $this->fieldtypeContext->setFieldContentState(FieldType::CONTENT_TYPE_PUBLISHED);
        $name = $this->fieldtypeContext->getThisContentTypeName();

        $this->dashboardContext->clickNavigationZone('Content');
        $this->dashboardContext->clickNavigationItem('Content structure');
        $this->dashboardContext->clickActionBar('Create');
        $this->dashboardContext->clickContentType($name);
        $this->platformStatus = self::WAITING_FOR_PUBLISHING;
    }

    /**
     * @When I edit this content
     */
    public function editThisContent()
    {
        $this->fieldtypeContext->setFieldContentState(FieldType::CONTENT_PUBLISHED);
        $name = $this->fieldtypeContext->getThisContentName();

        $this->dashboardContext->clickNavigationZone('Content');
        $this->dashboardContext->clickNavigationItem('Content structure');
        $this->dashboardContext->clickOnTreePath($name);
        $this->dashboardContext->clickActionBar('Edit');
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
            $this->dashboardContext->clickEditActionBar('Publish');
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
            // $type = ...
            //$name = $fieldtypeContext->getThisFieldTypeName();

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
        $this->dashboardContext->iSeeNotification(self::NOTIFICATION_CONTENT_PUBLISHED);
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
            $this->dashboardContext->clickEditActionBar('Publish');
        }
        $verification = new WebAssert($this->getSession());
        // for view we need the internal field identifier...
        $internalName = $this->fieldtypeContext->getFieldTypeInternalIdentifier($type);
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
        $this->fieldtypeContext->setFieldContentState(FieldType::CONTENT_PUBLISHED);
        $name = $this->fieldtypeContext->getThisContentName();

        $this->dashboardContext->clickNavigationZone('Content');
        $this->dashboardContext->clickNavigationItem('Content structure');
        $this->dashboardContext->clickOnTreePath($name);
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
