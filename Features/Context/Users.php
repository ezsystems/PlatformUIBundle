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
use EzSystems\PlatformBehatBundle\Context\RepositoryContext;
use eZ\Publish\API\Repository\Repository;
use eZ\Publish\API\Repository\UserService;
use eZ\Publish\API\Repository\ContentService;

class Users extends PlatformUI
{
    const USERGROUP_ROOT_CONTENT_ID = 4;
    const DEFAULT_LANGUAGE = 'eng-GB';

    use RepositoryContext;

    /**
     * @var eZ\Publish\API\Repository\ContentService
     */
    protected $userService;

    /**
     * @var eZ\Publish\API\Repository\ContentService
     */
    protected $contentService;

    /**
     * @var eZ\Publish\API\Repository\Values\User\User
     */
    protected $userDefault;

    /**
     * @injectService $repository @ezpublish.api.repository
     * @injectService $userService @ezpublish.api.service.user
     * @injectService $contentService @ezpublish.api.service.content
     */
    public function __construct(Repository $repository, UserService $userService, ContentService $contentService)
    {
        parent::__construct();
        $this->setRepository($repository);
        $this->userService = $userService;
        $this->contentService = $contentService;
        $this->userDefault = null;
    }

    /**
     * Return the default user, if there is none one is created.
     */
    protected function getDefaultUser()
    {
        if (!$this->userDefault) {
            $username = $password = 'User#' . uniqid();
            $email = $username . '@ez.no';
            $this->userDefault = $this->createUser($username, $email, $password);
        }

        return $this->userDefault;
    }

    /**
     * Create user inside given User Group.
     *
     * @param $username username of the user to create
     * @param $email email address of user to create
     * @param $password account password for user to create
     *
     * @return eZ\Publish\API\Repository\Values\User\User
     */
    protected function createUser($username, $email, $password)
    {
        $repository = $this->getRepository();

        $userCreateStruct = $this->userService->newUserCreateStruct(
            $username,
            $email,
            $password,
            self::DEFAULT_LANGUAGE
        );
        $userCreateStruct->setField('first_name', $username);
        $userCreateStruct->setField('last_name', $username);
        $parentGroup = $this->userService->loadUserGroup(self::USERGROUP_ROOT_CONTENT_ID);

        return $this->userService->createUser($userCreateStruct, array($parentGroup));
    }

    /**
     * @When I create a new User
     * @When I fill a new User fields with:
     */
    public function iCreateUser(TableNode $users = null)
    {
        $this->clickActionBar('Create');
        $this->waitWhileLoading('.ez-contenttypes-loading');
        $this->checkOption('Users');
        $this->clickContentType('User');
        if ($users) {
            foreach ($users as $user) {
                $this->fillFieldWithValue('First name', $user['First name']);
                $this->fillFieldWithValue('Last name', $user['Last name']);
                $this->fillFieldWithValue('Login', $user['Login']);
                $this->fillFieldWithValue('Email', $user['Email']);
                $this->fillFieldWithValue('Password', $user['Password']);
                $this->fillFieldWithValue('Confirm password', $user['Password']);
            }
        }
    }

    /**
     * @When I go to (the) User :username page
     * @When I go to a valid User page
     */
    public function goToUserPage($username = null)
    {
        if ($username) {
            $user = $this->userService->loadUserByLogin($username);
        } else {
            $user = $this->getDefaultUser();
        }
        $userObject = $this->contentService->loadContent($user->getUserId());
        $firstName = $userObject->getFieldValue('first_name');
        $lastName = $userObject->getFieldValue('last_name');

        $this->iAmOnPage('Users');
        $this->waitWhileLoading();
        $this->clickOnTreePath("$firstName $lastName");
        $this->sleep(); //safeguard for application delays
    }

    /**
     * @When I edit user :username
     */
    public function editUserUser($username)
    {
        if ($username) {
            $user = $this->userService->loadUserByLogin($username);
        } else {
            $user = $this->getDefaultUser();
        }

        $userObject = $this->contentService->loadContent($user->getUserId());
        $firstName = $userObject->getFieldValue('first_name');
        $lastName = $userObject->getFieldValue('last_name');

        $this->clickOnTreePath("$firstName $lastName");
        $this->sleep(); //safeguard for application delays
        $this->waitWhileLoading();
        $this->clickActionBar('Edit');
    }

    /**
     * @Then I see the Users page
     */
    public function iSeeUsersPage()
    {
        $this->sleep(); // safeguard for application delays
        $this->iSeeTitle('Users');
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
