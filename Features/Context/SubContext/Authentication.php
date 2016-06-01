<?php

/**
 * File containing the Authentication Functions for context class PlatformUI.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 * @version //autogentag//
 */
namespace EzSystems\PlatformUIBundle\Features\Context\SubContext;

use EzSystems\PlatformUIBundle\Features\Context\PlatformUI;
use EzSystems\PlatformBehatBundle\Context\RepositoryContext;
use eZ\Publish\API\Repository\Repository;
use eZ\Publish\API\Repository\UserService;
use eZ\Publish\API\Repository\RoleService;

class Authentication extends PlatformUI
{
    use RepositoryContext;

    const DEFAULT_LANGUAGE = 'eng-GB';
    const USERGROUP_ROOT_CONTENT_ID = 4;

    /**
     * Control variable to check if logged in.
     *
     * @var bool
     */
    protected $shouldBeLoggedIn;

    /**
     * @var \eZ\Publish\API\Repository\UserService
     */
    protected $userService;

    /**
     * @var \eZ\Publish\API\Repository\RoleService
     */
    protected $roleService;

    /**
     * @injectService $repository @ezpublish.api.repository
     * @injectService $userService @ezpublish.api.service.user
     * @injectService $roleService @ezpublish.api.service.role
     */
    public function __construct(Repository $repository, UserService $userService, RoleService $roleService)
    {
        $this->setRepository($repository);
        $this->userService = $userService;
        $this->roleService = $roleService;
    }

    /**
     * Get credentials for a specific role.
     *
     * @uses \EzSystems\BehatBundle\Context\Object\User
     * @throws \eZ\Publish\API\Repository\Exceptions\NotFoundException
     *
     * @param string $role Role intended for testing
     *
     * @return array Associative with 'login' and 'password'
     */
    protected function getCredentialsFor($roleIdentifier)
    {
        $role = $this->roleService->loadRoleByIdentifier($roleIdentifier);

        // create a new user, uses 'User' trait
        $username = 'User' . uniqid();
        $password = $username;
        $email = "${username}@ez.no";
        $userCreateStruct = $this->userService->newUserCreateStruct(
            $username,
            $email,
            $password,
            self::DEFAULT_LANGUAGE
        );
        $userCreateStruct->setField('first_name', $username);
        $userCreateStruct->setField('last_name', $username);

        $parentGroup = $this->userService->loadUserGroup(self::USERGROUP_ROOT_CONTENT_ID);
        $user = $this->userService->createUser($userCreateStruct, array($parentGroup));

        // Assign role to created user (without limitation)
        $this->roleService->assignRoleToUser($role, $user);

        return array(
            'login' => $username,
            'password' => $password,
        );
    }

    /**
     * @AfterScenario
     */
    public function afterScenarioLogout()
    {
        $this->iLogout();
    }

    /**
     * @Given I go to homepage
     */
    public function goToPlatformUi($url = '')
    {
        $this->getSession()->visit(
            $this->locatePath(
                self::PLATFORM_URI . $url
            )
        );
    }

    /**
     * @Given I go to PlatformUI app with username :user and password :password
     */
    public function goToPlatformUiAndLogIn($username, $password)
    {
        $this->goToPlatformUi();
        $this->waitWhileLoading();
        $this->fillFieldWithValue('username', $username);
        $this->fillFieldWithValue('password', $password);
        $this->clickElementByText('Login', 'button');
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
    public function loggedAsRolePlatformUI($role)
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
        $el = $this->findWithWait('.ez-user-profile');
        $el->focus();
        $this->waitWhileLoading();
        $el->click();
        $this->waitWhileLoading();
        $this->clickElementByText('Logout', 'a');
    }

    /**
     * @Then I should be logged in
     */
    public function iShouldBeLoggedIn()
    {
        $this->spin(
            function () {
                $logoutElement = $this->findWithWait('.ez-user-profile');

                return $logoutElement != null;
            }
        );
    }
}
