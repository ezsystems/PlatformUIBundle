<?php

/**
 * File containing the User Functions for context class PlatformUI.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 * @version //autogentag//
 */
namespace EzSystems\PlatformUIBundle\Features\Context;

use Behat\Gherkin\Node\TableNode;

class Users extends PlatformUI
{
    /**
     * @var EzSystems\PlatformUIBundle\Features\Context\SubContext\DashboardContext
     * @Context $dashboardContext EzSystems\PlatformUIBundle\Features\Context\SubContext\DashboardContext
     */
    protected $dashboardContext;

    /**
     * @var EzSystems\PlatformUIBundle\Features\Context\SubContext\BrowserContext
     * @Context $browserContext EzSystems\PlatformUIBundle\Features\Context\SubContext\BrowserContext
     */
    protected $browserContext;

    /**
     * @Given I am on the Users page
     */
    public function onUsersPage()
    {
        $this->getSession()->visit(
            $this->locatePath(
                self::PLATFORM_URI . '#/view/%2Fapi%2Fezp%2Fv2%2Fcontent%2Flocations%2F1%2F5/eng-GB'
            )
        );
    }

    /**
     * @When I create a new User
     * @When I fill a new User fields with:
     */
    public function iCreateUser(TableNode $users = null)
    {
        $this->dashboardContext->clickActionBar('Create');
        $this->waitWhileLoading('.ez-contenttypes-loading');
        $this->browserContext->checkOption('Users');
        $this->dashboardContext->clickContentType('User');
        if ($users) {
            foreach ($users as $user) {
                $this->browserContext->fillFieldWithValue('First name', $user['First name']);
                $this->browserContext->fillFieldWithValue('Last name', $user['Last name']);
                $this->browserContext->fillFieldWithValue('Login', $user['Login']);
                $this->browserContext->fillFieldWithValue('Email', $user['Email']);
                $this->browserContext->fillFieldWithValue('Password', $user['Password']);
                $this->browserContext->fillFieldWithValue('Confirm password', $user['Password']);
            }
        }
    }

    /**
     * @When I edit user :username
     */
    public function editUserUser($username)
    {
        $this->dashboardContext->clickOnTreePath("$username $username");
        $this->sleep(); //safegaurd for application delays
        $this->waitWhileLoading();
        $this->dashboardContext->clickActionBar('Edit');
    }

    /**
     * @Then I see the Users page
     */
    public function iSeeUsersPage()
    {
        $this->sleep(); // safegaurd for application delays
        $this->browserContext->iSeeTitle('Users');
    }

    /**
     * @Then I see the following users:
     */
    public function iSeeUsers(TableNode $users)
    {
        foreach ($users as $user) {
            $name = $user['Name'];
            $element = $this->getElementByText($name, '.ez-subitemlist-table td');
            if (!$element) {
                throw new \Exception("User not found $name");
            }
        }
    }

    /**
     * @Then I see the following tabs:
     */
    public function iSeeTabs(TableNode $tabs)
    {
        foreach ($tabs as $tab) {
            $label = $tab['Tabs'];
            $element = $this->getElementByText($label, '.ez-tabs-label');
            if (!$element) {
                throw new \Exception("Tab with $label not found");
            }
        }
    }

    /**
     * @Then I should see error messages
     */
    public function iSeeErrors()
    {
        if (!$this->foundErrors()) {
            throw new \Exception('Expected errors on the page but none were found');
        }
    }

    /**
     * @Then I should see no error messages
     */
    public function iSeeNoErrors()
    {
        if ($this->foundErrors()) {
            throw new \Exception('Errors found in the page');
        }
    }
    /**
     * Helper function, returns true if errors are found in the page, false otherwise.
     */
    private function foundErrors()
    {
        $page = $this->getSession()->getPage();
        $element = $page->find('css', '.is-error');

        return $element != null;
    }
}
