<?php

/**
 * File containing the Authentication Functions for context class PlatformUI.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 * @version //autogentag//
 */
namespace EzSystems\PlatformUIBundle\Features\Context\SubContext;

use Behat\Mink\WebAssert;

trait Authentication
{
    /**
     * Control variable to check if logged in.
     *
     * @var bool
     */
    protected $shouldBeLoggedIn;

    /**
     * @Given I go to homepage
     */
    public function goToPlatformUi($url = '')
    {
        $this->visit($this->platformUiUri . $url);
    }

    /**
     * @Given I go to PlatformUI app with username :user and password :password
     */
    public function goToPlatformUiAndLogIn($username, $password)
    {
        // Given I go to PlatformUI app
        $this->goToPlatformUi();
        //wait fos JS
        $this->waitForJs();
        // And I fill in "Username" with "admin"
        $this->fillFieldWithValue('Username', $username);
        //And I fill in "Password" with "publish"
        $this->fillFieldWithValue('Password', $password);
        //And I click on the "Login" button
        $this->iClickAtButton('Login');
        //wait fos JS
        $this->waitForJs();
        //Then I should be logged in
        $this->iShouldBeLoggedIn();
    }

    /**
     * @Given I am logged in as admin on PlatformUI
     */
    public function loggedAsUserPlatformUi()
    {
        $this->goToPlatformUiAndLogIn($this->user, $this->password);
    }

    /**
     * @Given I am logged in as an :role in PlatformUI
     */
    public function loggedAsEditorPlatformUI($role)
    {
        $credentials = $this->getCredentialsFor($role);
        $this->goToPlatformUiAndLogIn($credentials['login'], $credentials['password']);
    }

    /**
     * @Given I logout
     */
    public function iLogout()
    {
        $this->shouldBeLoggedIn = false;
        $this->goToPlatformUi('#/dashboard');
        $this->waitForJs();
        $this->iClickAtLink('Logout');
    }

    /**
     * @Then I should be logged in
     */
    public function iShouldBeLoggedIn()
    {
        $this->shouldBeLoggedIn = true;

        $verification = new WebAssert($this->getSession());
        $verification->elementNotExists('css', '.ez-loginform');
        $jsCode = "return (document.querySelector('.ez-loginform') === null);";
    }

    /**
     * Logs the user out.
     *
     * @AfterScenario
     */
    public function loggOutAfterScenario()
    {
        $this->iLogout();
    }
}
