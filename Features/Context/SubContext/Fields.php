<?php

/**
 * File containing the Common Functions for context class PlatformUI.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 * @version //autogentag//
 */

namespace EzSystems\PlatformUIBundle\Features\Context\SubContext;

use EzSystems\BehatBundle\ObjectManager\FieldType;
use Behat\Mink\WebAssert;

trait Fields
{
    /**
     * @When I create a content of this type
     */
    public function createAContentOfThisType()
    {
        $fieldManager = $this->getFieldTypeManager();
        $fieldManager->setFieldContentState( FieldType::CONTENT_TYPE_PUBLISHED );
        $type = $fieldManager->getThisContentTypeName( 'eng-GB' );

        $this->loggedAsAdminPlatformUi();
        $this->clickNavigationZone( "Platform" );
        $this->waitForLoadings();
        $this->iClickAtLink( "Content structure" );
        $this->waitForLoadings();
        $this->clickActionBar( "Create a content" );
        $this->waitForLoadings();
        $this->clickContentType( $type );
        $this->waitForLoadings();
        $this->platformStatus = self::WAITING_FOR_PUBLISHING;
    }

    /**
     * @When I edit this content
     */
    public function editThisContent()
    {
        $fieldManager = $this->getFieldTypeManager();
        $fieldManager->setFieldContentState( FieldType::CONTENT_PUBLISHED );
        $name = $fieldManager->getThisContentName( 'eng-GB' );

        $this->loggedAsAdminPlatformUi();
        $this->clickNavigationZone( "Platform" );
        $this->waitForLoadings();
        $this->iClickAtLink( "Content structure" );
        $this->waitForLoadings();
        $this->openTreePath( $name );
        $this->waitForLoadings();
        $this->clickActionBar( "Edit" );
        $this->waitForLoadings();
        $this->platformStatus = self::WAITING_FOR_PUBLISHING;
    }

    /**
     * @When I view this Content
     */
    public function viewThisContent()
    {
        $fieldManager = $this->getFieldTypeManager();
        $fieldManager->setFieldContentState( FieldType::CONTENT_PUBLISHED );
        $name = $fieldManager->getThisContentName( 'eng-GB' );

        $this->loggedAsAdminPlatformUi();
        $this->clickNavigationZone( "Platform" );
        $this->waitForLoadings();
        $this->iClickAtLink( "Content structure" );
        $this->waitForLoadings();
        $this->openTreePath( $name );
        $this->waitForLoadings();
    }

    /**
     * @When I set :value as the Field Value
     * @And I set :value as the Field Value
     */
    public function setFieldValue( $value )
    {
        $fieldManager = $this->getFieldTypeManager();
        $name = $fieldManager->getThisFieldTypeName( 'eng-GB' );
        $this->fillFieldWithValue( $name, $value );
    }

    /**
     * @When I publish the content
     * @And I publish the content
     */
    public function publishContent()
    {
        if ( $this->platformStatus == self::WAITING_FOR_PUBLISHING )
        {
            $this->clickActionBar( "Publish" );
        }
        else
        {
            throw new \Exception( "Cannot publish content, application in wrong state" );
        }
    }

    /**
     * @Then I should see an :type field
     * @Then I should see a :label label related with the :type field
     */
    public function seeFieldtOfType( $type, $label = null )
    {
        $this->executeDelayedActions();
        $verification = new WebAssert( $this->getSession() );
        $internalName = $this->getFieldTypeManager()->getFieldTypeInternalIdentifier( $type );
        $selector = ".ez-fieldview-$internalName";
        $verification->elementExists( 'css', $selector );
        if ( $label != null )
        {
            $verification->elementTextContains( 'css', '.ez-fieldview-name', $label );
        }
    }

    /**
     * @Then I should see a field with value :value
     */
    public function seeFieldtWithValue( $value )
    {
        $this->executeDelayedActions();
        $verification = new WebAssert( $this->getSession() );
        $verification->elementTextContains( 'css', '.ez-fieldview-value-content', $value );
    }

    /**
     * @Then the :label field should be marked as mandatory
     */
    public function seeRequiredFieldtOfType( $label )
    {
        if ( $this->platformStatus == self::WAITING_FOR_PUBLISHING )
        {
            $verification = new WebAssert( $this->getSession() );
            $verification->elementTextContains( 'css', '.ez-fielddefinition-name', $label . '*' );
        }
        else
        {
            throw new \Exception( "Cannot publish content, application in wrong state" );
        }
    }

    /**
     *  @Given I set an empty value as the Field Value
     *  @And I set an empty value as the Field Value
     *
     */
    public function setFieldValueToNothing()
    {
        $this->setFieldValue( "" );
    }

    /**
     *  @Then Publishing fails with validation error message :messege
     *
     * Creates a Content with the previously defined ContentType
     */
    public function failsWithMessage( $message )
    {
        $verification = new WebAssert( $this->getSession() );
        $verification->elementTextContains( 'css', '.ez-editfield-error-message', $message );
    }

    /**
     * @Then the Content is successfully published
     */
    public function contentIsPublished()
    {
        $page = $this->getSession()->getPage();
        $errors = $page->findAll( 'css', '.ez-editfield-error-message' );
        foreach ( $errors as $error )
        {
            $errorMessage = $error->getText();
            if ( $errorMessage != '' )
            {
                throw new \Exception( "Content could not be published with error message: $errorMessage" );
            }
        }
    }
}
