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
use eZ\Publish\Core\Repository\Values\User\PolicyDraft;
use eZ\Publish\Core\Repository\Values\User\RoleCreateStruct;
use EzSystems\RepositoryForms\Data\Mapper\PolicyMapper;
use EzSystems\RepositoryForms\Data\Mapper\RoleMapper;
use EzSystems\RepositoryForms\Form\ActionDispatcher\ActionDispatcherInterface;
use EzSystems\RepositoryForms\Form\Type\Role\PolicyDeleteType;
use EzSystems\RepositoryForms\Form\Type\Role\RoleAssignmentDeleteType;
use EzSystems\RepositoryForms\Form\Type\Role\RoleCreateType;
use EzSystems\RepositoryForms\Form\Type\Role\RoleDeleteType;
use EzSystems\RepositoryForms\Form\Type\Role\RoleUpdateType;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\Translation\TranslatorInterface;

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

    /**
     * @var TranslatorInterface
     */
    private $translator;

    public function __construct(
        RoleService $roleService,
        ActionDispatcherInterface $roleActionDispatcher,
        ActionDispatcherInterface $policyActionDispatcher,
        TranslatorInterface $translator
    ) {
        $this->roleService = $roleService;
        $this->roleActionDispatcher = $roleActionDispatcher;
        $this->policyActionDispatcher = $policyActionDispatcher;
        $this->translator = $translator;
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
            'can_assign' => $this->isGranted(new Attribute('role', 'assign')),
            'can_create' => $this->isGranted(new Attribute('role', 'create')),
            'can_delete' => $this->isGranted(new Attribute('role', 'delete')),
            'create_form' => $createForm->createView(),
        ]);
    }

    /**
     * Renders a role, optionally showing a specific tab.
     *
     * @param int $roleId Role ID
     * @param string $tabId CSS ID of the view tab which should be shown
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function viewRoleAction($roleId, $tabId = null)
    {
        $role = $this->roleService->loadRole($roleId);
        $roleAssignments = $this->roleService->getRoleAssignments($role);
        $deleteForm = $this->createForm(new RoleDeleteType(), ['roleId' => $roleId]);
        $editablePolicies = [];

        $deleteFormsByPolicyId = [];
        foreach ($role->getPolicies() as $policy) {
            $policyId = $policy->id;
            $deleteFormsByPolicyId[$policyId] = $this->createForm(
                new PolicyDeleteType(),
                ['policyId' => $policyId, 'roleId' => $roleId]
            )->createView();

            // We cannot edit policies that don't have a function defined, or that cannot have limitations.
            $limitationTypes = $policy->module ? $this->roleService->getLimitationTypesByModuleFunction($policy->module, $policy->function) : [];
            if (count($limitationTypes) > 0) {
                $editablePolicies[$policyId] = true;
            }
        }

        $deleteFormsByAssignment = [];
        foreach ($roleAssignments as $roleAssignment) {
            $deleteFormsByAssignment[$roleAssignment->id] = $this->createForm(
                new RoleAssignmentDeleteType(),
                ['assignmentId' => $roleAssignment->id]
            )->createView();
        }

        return $this->render('eZPlatformUIBundle:Role:view_role.html.twig', [
            'role' => $role,
            'deleteFormsByPolicyId' => $deleteFormsByPolicyId,
            'role_assignments' => $roleAssignments,
            'deleteForm' => $deleteForm->createView(),
            'can_edit' => $this->isGranted(new Attribute('role', 'update')),
            'can_assign' => $this->isGranted(new Attribute('role', 'assign')),
            'can_delete' => $this->isGranted(new Attribute('role', 'delete')),
            'deleteFormsByAssignment' => $deleteFormsByAssignment,
            'editablePolicies' => $editablePolicies,
            'tab_id' => $tabId,
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
            // If the draft is not yet published, we load it directly.
            $roleDraft = $this->roleService->loadRoleDraft($roleId);
        } catch (NotFoundException $e) {
            try {
                // If the draft has been published, we load it by the published ID
                $roleDraft = $this->roleService->loadRoleDraftByRoleId($roleId);
            } catch (NotFoundException $e) {
                // The draft doesn't exist, let's create one
                $role = $this->roleService->loadRole($roleId);
                $roleDraft = $this->roleService->createRoleDraft($role);
            }
        }

        $roleData = (new RoleMapper())->mapToFormData($roleDraft);
        $form = $this->createForm(new RoleUpdateType(), $roleData);
        $actionUrl = $this->generateUrl('admin_roleUpdate', ['roleId' => $roleId]);

        // Synchronize form and data.
        $form->handleRequest($request);
        $hasErrors = false;
        if ($form->isValid()) {
            $this->roleActionDispatcher->dispatchFormAction(
                $form,
                $roleData,
                $form->getClickedButton() ? $form->getClickedButton()->getName() : null
            );
            if ($response = $this->roleActionDispatcher->getResponse()) {
                return $response;
            }

            return $this->redirectAfterFormPost($actionUrl);
        } elseif ($form->isSubmitted()) {
            $hasErrors = true;
        }

        $formView = $form->createView();

        return $this->render('eZPlatformUIBundle:Role:update_role.html.twig', [
            'form' => $formView,
            'action_url' => $actionUrl,
            'role_draft' => $roleDraft,
            'role_name' => $roleData->isNew() ? 'role.name_new' : $roleDraft->identifier,
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
        $role = $this->roleService->loadRole($roleId);
        try {
            $roleDraft = $this->roleService->loadRoleDraftByRoleId($roleId);
        } catch (NotFoundException $e) {
            // The draft doesn't exist, let's create one
            $roleDraft = $this->roleService->createRoleDraft($role);
        }

        $policy = new PolicyDraft(['innerPolicy' => new Policy()]);
        if ($policyId) {
            foreach ($roleDraft->getPolicies() as $policy) {
                if ($policy->originalId == $policyId) {
                    goto buildFormData;
                }
            }

            throw new BadRequestHttpException(
                $this->translator->trans('role.error.policy_not_found', ['%policyId%' => $policyId, '%roleId%' => $roleId], 'role')
            );
        }

        buildFormData:
        $limitationTypes = $policy->module ? $this->roleService->getLimitationTypesByModuleFunction($policy->module, $policy->function) : [];
        $policyData = (new PolicyMapper())->mapToFormData($policy, [
            'roleDraft' => $roleDraft,
            'initialRole' => $role,
            'availableLimitationTypes' => $limitationTypes,
        ]);
        $actionUrl = $this->generateUrl('admin_policyEdit', ['roleId' => $roleId, 'policyId' => $policyId]);
        $form = $this->createForm('ezrepoforms_policy_edit', $policyData);
        $form->handleRequest($request);
        if ($form->isValid()) {
            $this->policyActionDispatcher->dispatchFormAction(
                $form,
                $policyData,
                $form->getClickedButton() ? $form->getClickedButton()->getName() : null
            );
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

    public function deletePolicyAction(Request $request, $roleId, $policyId)
    {
        $role = $this->roleService->loadRole($roleId);
        $deleteForm = $this->createForm(
            new PolicyDeleteType(),
            ['policyId' => $policyId, 'roleId' => $roleId]
        );
        $deleteForm->handleRequest($request);

        if ($deleteForm->isValid()) {
            try {
                $roleDraft = $this->roleService->loadRoleDraftByRoleId($roleId);
            } catch (NotFoundException $e) {
                // The draft doesn't exist, let's create one
                $roleDraft = $this->roleService->createRoleDraft($role);
            }

            $foundPolicy = false;
            /** @var PolicyDraft $policy */
            foreach ($roleDraft->getPolicies() as $policy) {
                if ($policy->originalId == $policyId) {
                    $foundPolicy = true;
                    break;
                }
            }

            if (!$foundPolicy) {
                throw new BadRequestHttpException(
                    $this->translator->trans('role.error.policy_not_found', ['%policyId%' => $policyId, '%roleId%' => $roleId], 'role')
                );
            }

            $this->roleService->removePolicyByRoleDraft($roleDraft, $policy);
            $this->roleService->publishRoleDraft($roleDraft);
            $this->notify('role.policy.deleted', ['%roleIdentifier%' => $role->identifier, '%policyId%' => $policyId], 'role');
        } elseif ($deleteForm->isSubmitted()) {
            $this->notifyError('role.policy.error.delete', ['%roleIdentifier%' => $role->identifier, '%policyId%' => $policyId], 'role');
        }

        return $this->redirectToRouteAfterFormPost('admin_roleView', ['roleId' => $roleId, 'tabId' => null]);
    }

    /**
     * Deletes a role assignment.
     *
     * @param Request $request
     * @param int $roleAssignmentId Role assignment ID
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function deleteRoleAssignmentAction(Request $request, $roleAssignmentId)
    {
        $roleAssignment = $this->roleService->loadRoleAssignment($roleAssignmentId);
        $deleteForm = $this->createForm(new RoleAssignmentDeleteType(), ['assignmentId' => $roleAssignmentId]);
        $deleteForm->handleRequest($request);
        if ($deleteForm->isValid()) {
            $this->roleService->removeRoleAssignment($roleAssignment);
            $this->notify('role.assignment.deleted', [], 'role');
        } elseif ($deleteForm->isSubmitted()) {
            $this->notifyError('role.assignment.error.delete', [], 'role');
        }

        return $this->redirectToRouteAfterFormPost('admin_roleView', ['roleId' => $roleAssignment->role->id]);
    }
}
