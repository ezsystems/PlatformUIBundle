<?php

/**
 * File containing the Common Functions for context class PlatformUI.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 * @version //autogentag//
 */

namespace EzSystems\PlatformUIBundle\Features\Context\SubContext;

use EzSystems\PlatformUIBundle\Features\Helper\JavaScript as JsHelper;
use PHPUnit_Framework_Assert as Assertion;

trait Authentication
{
    /**
     * Control variable to check if logged in
     *
     * @var boolean
     */
    protected $shouldBeLoggedIn;

    /**
     * @Given I go to homepage
     */
    public function goToPlatformUi()
    {
        $this->visit( $this->platformUiUri );
    }

    /**
     * @Given I go to PlatformUI app with username :user and password :password
     */
    public function goToPlatformUiAndLogIn( $username, $password )
    {
        // Given I go to PlatformUI app
        $this->goToPlatformUi();
        //wait fos JS
        $this->waitForJs();
        // And I fill in "Username" with "admin"
        $this->fillFieldWithValue( 'Username', $username );
        //And I fill in "Password" with "publish"
        $this->fillFieldWithValue( 'Password', $password );
        //And I click on the "Login" button
        $this->iClickAtButton( 'Login' );
        //wait fos JS
        $this->waitForJs();
        //Then I should be logged in
        $this->iShouldBeLoggedIn();
        //Catches Js errors
        $this->activateJsErrorHandler();
    }

    /**
     * @Given I am logged in as admin on PlatformUI
     */
    public function loggedAsAdminPlatformUi()
    {
        $this->goToPlatformUiAndLogIn( "admin", "publish" );
    }

    /**
     * @Given I logout
     */
    public function iLogout()
    {
        $this->shouldBeLoggedIn = false;
        $this->iClickAtLink( "Logout" );
    }

    /**
     * @Then I should be logged in
     */
    public function iShouldBeLoggedIn()
    {
        $this->shouldBeLoggedIn = true;

        $jsCode = "return (document.querySelector('.ez-loginform') === null);";

        $isLoggedIn = $this->evalJavascript( $jsCode, false );
        Assertion::assertTrue( $isLoggedIn, "Not logged in" );
    }

    /**
     * Checks if the user is still logged in
     *
     * @AfterStep
     */
    public function runAfterStep()
    {
        if ( $this->shouldBeLoggedIn )
        {
            $this->iShouldBeLoggedIn();
        }
    }

    /**
     * Checks if the user is still logged in
     *
     * @AfterScenario
     */
    public function loggOutAfterScenario()
    {
        $this->iLogout();
    }
}
