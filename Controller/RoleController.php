<?php

/**
 * File containing the RoleController class.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle\Controller;

use eZ\Publish\API\Repository\Exceptions\NotFoundException;
use eZ\Publish\API\Repository\RoleService;
use eZ\Publish\Core\MVC\Symfony\Security\Authorization\Attribute;
use eZ\Publish\Core\Repository\Values\User\Policy;
use eZ\Publish\Core\Repository\Values\User\RoleCreateStruct;
use EzSystems\RepositoryForms\Data\Mapper\PolicyMapper;
use EzSystems\RepositoryForms\Data\Mapper\RoleMapper;
use EzSystems\RepositoryForms\Form\ActionDispatcher\ActionDispatcherInterface;
use EzSystems\RepositoryForms\Form\Type\Role\RoleCreateType;
use EzSystems\RepositoryForms\Form\Type\Role\RoleDeleteType;
use EzSystems\RepositoryForms\Form\Type\Role\RoleUpdateType;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class RoleController extends Controller
{
    /**
     * @var \eZ\Publish\API\Repository\RoleService
     */
    protected $roleService;

    /**
     * @var ActionDispatcherInterface
     */
    private $roleActionDispatcher;

    /**
     * @var ActionDispatcherInterface
     */
    private $policyActionDispatcher;

    public function __construct(
        RoleService $roleService,
        ActionDispatcherInterface $roleActionDispatcher,
        ActionDispatcherInterface $policyActionDispatcher
    ) {
        $this->roleService = $roleService;
        $this->roleActionDispatcher = $roleActionDispatcher;
        $this->policyActionDispatcher = $policyActionDispatcher;
    }

    /**
     * Renders the role list.
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function listRolesAction()
    {
        $createForm = $this->createForm(new RoleCreateType());

        return $this->render('eZPlatformUIBundle:Role:list_roles.html.twig', [
            'roles' => $this->roleService->loadRoles(),
            'can_edit' => $this->isGranted(new Attribute('role', 'update')),
            'can_create' => $this->isGranted(new Attribute('role', 'create')),
            'can_delete' => $this->isGranted(new Attribute('role', 'delete')),
            'create_form' => $createForm->createView(),
        ]);
    }

    /**
     * Renders a role.
     *
     * @param int $roleId Role ID
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function viewRoleAction($roleId)
    {
        $role = $this->roleService->loadRole($roleId);
        $roleAssignments = $this->roleService->getRoleAssignments($role);
        $deleteForm = $this->createForm(new RoleDeleteType(), ['roleId' => $roleId]);

        return $this->render('eZPlatformUIBundle:Role:view_role.html.twig', [
            'role' => $role,
            'role_assignments' => $roleAssignments,
            'deleteForm' => $deleteForm->createView(),
            'can_edit' => $this->isGranted(new Attribute('role', 'update')),
            'can_delete' => $this->isGranted(new Attribute('role', 'delete')),
        ]);
    }

    /**
     * Creates a role.
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function createRoleAction(Request $request)
    {
        $createForm = $this->createForm(new RoleCreateType());
        $createForm->handleRequest($request);
        if ($createForm->isValid()) {
            $roleCreateStruct = new RoleCreateStruct(['identifier' => '__new__' . md5(microtime(true))]);
            $role = $this->roleService->createRole($roleCreateStruct);

            return $this->redirectToRouteAfterFormPost('admin_roleUpdate', ['roleId' => $role->id]);
        }

        // Form validation failed. Send errors as notifications.
        foreach ($createForm->getErrors(true) as $error) {
            $this->notifyErrorPlural(
                $error->getMessageTemplate(),
                $error->getMessagePluralization(),
                $error->getMessageParameters(),
                'ezrepoforms_content_type'
            );
        }

        return $this->redirectToRouteAfterFormPost('admin_roleList');
    }

    /**
     * Updates a role.
     *
     * @param int $roleId Role ID
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function updateRoleAction(Request $request, $roleId)
    {
        try {
            $roleDraft = $this->roleService->loadRoleDraft($roleId);
        } catch (NotFoundException $e) {
            // The draft doesn't exist, let's create one
            $role = $this->roleService->loadRole($roleId);
            $roleDraft = $this->roleService->createRoleDraft($role);
        }

        $roleData = (new RoleMapper())->mapToFormData($roleDraft);
        $form = $this->createForm(new RoleUpdateType(), $roleData);
        $actionUrl = $this->generateUrl('admin_roleUpdate', ['roleId' => $roleId]);

        // Synchronize form and data.
        $form->handleRequest($request);
        $hasErrors = false;
        if ($form->isValid()) {
            $this->roleActionDispatcher->dispatchFormAction($form, $roleData, $form->getClickedButton()->getName());
            if ($response = $this->roleActionDispatcher->getResponse()) {
                return $response;
            }

            return $this->redirectAfterFormPost($actionUrl);
        } elseif ($form->isSubmitted()) {
            $hasErrors = true;
        }

        $formView = $form->createView();

        // Show empty text input when name is not set, while showing "New role" in the page title
        $roleName = $roleDraft->identifier;
        if ($roleData->isNew()) {
            $roleName = 'role.name_new';
            $formView->vars['role_input_value'] = '';
        } else {
            $formView->vars['role_input_value'] = $roleName;
        }

        return $this->render('eZPlatformUIBundle:Role:update_role.html.twig', [
            'form' => $formView,
            'action_url' => $actionUrl,
            'role_draft' => $roleDraft,
            'role_name' => $roleName,
            'hasErrors' => $hasErrors,
        ]);
    }

    /**
     * Deletes a role.
     *
     * @param Request $request
     * @param int $roleId Role ID
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function deleteRoleAction(Request $request, $roleId)
    {
        $role = $this->roleService->loadRole($roleId);
        $deleteForm = $this->createForm(new RoleDeleteType(), ['roleId' => $roleId]);
        $deleteForm->handleRequest($request);
        if ($deleteForm->isValid()) {
            $this->roleService->deleteRole($role);
            $this->notify('role.deleted', ['%roleIdentifier%' => $role->identifier], 'role');
        } elseif ($deleteForm->isSubmitted()) {
            $this->notifyError('role.error.delete', ['%roleIdentifier%' => $role->identifier], 'role');
        }

        return $this->redirectToRouteAfterFormPost('admin_roleList');
    }

    public function editPolicyAction(Request $request, $roleId, $policyId = null)
    {
        try {
            $roleDraft = $this->roleService->loadRoleDraft($roleId);
        } catch (NotFoundException $e) {
            // The draft doesn't exist, let's create one
            $role = $this->roleService->loadRole($roleId);
            $roleDraft = $this->roleService->createRoleDraft($role);
        }

        $policy = new Policy();
        if ($policyId) {
            foreach ($roleDraft->getPolicies() as $policy) {
                if ($policy->id === $policyId) {
                    break;
                }
            }

            throw new BadRequestHttpException("Role #$roleId doesn't contain any policy with ID #$policyId");
        }

        $policyData = (new PolicyMapper())->mapToFormData($policy, ['roleDraft' => $roleDraft]);
        $actionUrl = $this->generateUrl('admin_policyEdit', ['roleId' => $roleId, 'policyId' => $policyId]);
        $form = $this->createForm('ezrepoforms_policy_edit', $policyData);
        $form->handleRequest($request);
        if ($form->isValid()) {
            $this->policyActionDispatcher->dispatchFormAction($form, $policyData, $form->getClickedButton()->getName());
            if ($response = $this->policyActionDispatcher->getResponse()) {
                return $response;
            }

            return $this->redirectAfterFormPost($actionUrl);
        }

        return $this->render('eZPlatformUIBundle:Role:edit_policy.html.twig', [
            'form' => $form->createView(),
            'actionUrl' => $actionUrl,
            'policy' => $policyData,
        ]);
    }
}
