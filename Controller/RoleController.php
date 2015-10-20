<?php

/**
 * File containing the RoleController class.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle\Controller;

use eZ\Publish\API\Repository\Exceptions\NotFoundException;
use eZ\Publish\API\Repository\ContentTypeService;
use eZ\Publish\API\Repository\RoleService;
use eZ\Publish\API\Repository\SectionService;
use eZ\Publish\API\Repository\Values\User\Role;
use eZ\Publish\Core\MVC\Symfony\Security\Authorization\Attribute;
use eZ\Publish\Core\Repository\Values\User\Policy;
use eZ\Publish\Core\Repository\Values\User\PolicyDraft;
use eZ\Publish\Core\Repository\Values\User\RoleCreateStruct;
use EzSystems\RepositoryForms\Data\Mapper\PolicyMapper;
use EzSystems\RepositoryForms\Data\Mapper\RoleMapper;
use EzSystems\RepositoryForms\Form\ActionDispatcher\ActionDispatcherInterface;
use EzSystems\RepositoryForms\Form\Type\Role\PolicyDeleteType;
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

    /**
     * @var \eZ\Publish\API\Repository\ContentTypeService
     */
    private $contentTypeService;

    /**
     * @var \eZ\Publish\API\Repository\SectionService
     */
    private $sectionService;

    /**
     * List of configured siteaccesses.
     *
     * @var array
     */
    protected $siteAccessList;

    public function __construct(
        RoleService $roleService,
        ActionDispatcherInterface $roleActionDispatcher,
        ActionDispatcherInterface $policyActionDispatcher,
        TranslatorInterface $translator,
        ContentTypeService $contentTypeService,
        SectionService $sectionService,
        array $siteAccessList
    ) {
        $this->roleService = $roleService;
        $this->roleActionDispatcher = $roleActionDispatcher;
        $this->policyActionDispatcher = $policyActionDispatcher;
        $this->translator = $translator;
        $this->contentTypeService = $contentTypeService;
        $this->sectionService = $sectionService;
        $this->siteAccessList = $siteAccessList;
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
        $deleteFormsByPolicyId = [];
        foreach ($role->getPolicies() as $policy) {
            $policyId = $policy->id;
            $deleteFormsByPolicyId[$policyId] = $this->createForm(
                new PolicyDeleteType(),
                ['policyId' => $policyId, 'roleId' => $roleId]
            )->createView();
        }

        // Populate policy limitations with links and translated identifiers
        $displayPolicyLimitations = $this->buildDisplayPolicyLimitations($role);

        return $this->render('eZPlatformUIBundle:Role:view_role.html.twig', [
            'role' => $role,
            'deleteFormsByPolicyId' => $deleteFormsByPolicyId,
            'role_assignments' => $roleAssignments,
            'deleteForm' => $deleteForm->createView(),
            'can_edit' => $this->isGranted(new Attribute('role', 'update')),
            'can_delete' => $this->isGranted(new Attribute('role', 'delete')),
            'display_policy_limitations' => $displayPolicyLimitations,
        ]);
    }

    /**
     * Build the policy limitation values to be displayed, enriched with translations and links.
     *
     * @param Role $role Role
     *
     * @return array
     */
    protected function buildDisplayPolicyLimitations(Role $role)
    {
        $displayPolicyLimitations = [];

        foreach ($role->getPolicies() as $policy) {
            $displayPolicyLimitations[$policy->id] = [];
            foreach ($policy->getLimitations() as $limitation) {
                $limitationValues = [];
                switch ($limitation->getIdentifier()) {
                    case 'Class':
                        $limitationName = 'role.policy.limitation.identifier.class';
                        foreach ($limitation->limitationValues as $limitationValue) {
                            $contentType = $this->contentTypeService->loadContentType($limitationValue);
                            $limitationValues[] = [
                                'href' => $this->generateUrl(
                                    'admin_contenttypeView',
                                    ['contentTypeId' => $limitationValue]
                                ),
                                'name' => $contentType->getName($contentType->mainLanguageCode),
                            ];
                        }
                        break;
                    case 'ParentClass':
                        $limitationName = 'role.policy.limitation.identifier.parentclass';
                        foreach ($limitation->limitationValues as $limitationValue) {
                            $contentType = $this->contentTypeService->loadContentType($limitationValue);
                            $limitationValues[] = [
                                'href' => $this->generateUrl(
                                    'admin_contenttypeView',
                                    ['contentTypeId' => $limitationValue]
                                ),
                                'name' => $contentType->getName($contentType->mainLanguageCode),
                            ];
                        }
                        break;
                    case 'Section':
                        $limitationName = 'role.policy.limitation.identifier.section';
                        foreach ($limitation->limitationValues as $limitationValue) {
                            $limitationValues[] = [
                                'href' => $this->generateUrl(
                                    'admin_sectionview',
                                    ['sectionId' => $limitationValue]
                                ),
                                'name' => $this->sectionService->loadSection($limitationValue)->name,
                            ];
                        }
                        break;
                    case 'SiteAccess':
                        $limitationName = 'role.policy.limitation.identifier.siteaccess';
                        foreach ($limitation->limitationValues as $limitationValue) {
                            $foundSiteaccessName = 'undefined:' . $limitationValue;
                            foreach ($this->siteAccessList as $siteaccessName) {
                                if ($limitationValue === sprintf('%u', crc32($siteaccessName))) {
                                    $foundSiteaccessName = $siteaccessName;
                                    break;
                                }
                            }
                            $limitationValues[] = [
                                'href' => false,
                                'name' => $foundSiteaccessName,
                            ];
                        }
                        break;
                    case 'Owner':
                        $limitationName = 'role.policy.limitation.identifier.owner';
                        foreach ($limitation->limitationValues as $limitationValue) {
                            // '2:session' is the same as '1:self', see https://doc.ez.no/display/EZP/OwnerLimitation
                            if ($limitationValue === '1' || $limitationValue === '2') {
                                $ownerName = $this->translator->trans(
                                    'role.policy.limitation.identifier.owner.self',
                                    [],
                                    'role'
                                );
                            } else {
                                $ownerName = $limitationValue;
                            }
                            $limitationValues[] = [
                                'href' => false,
                                'name' => $ownerName,
                            ];
                        }
                        break;
                    // TODO are there any others?
                    default:
                        $limitationName = $limitation->getIdentifier();
                        $limitationValues = [];
                }
                $displayPolicyLimitations[$policy->id][] = [
                    'identifier' => $limitation->getIdentifier(),
                    'name' => $limitationName,
                    'values' => $limitationValues,
                ];
            }
        }

        return $displayPolicyLimitations;
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
            $roleDraft = $this->roleService->loadRoleDraftByRoleId($roleId);
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
        $policyData = (new PolicyMapper())->mapToFormData($policy, ['roleDraft' => $roleDraft, 'initialRole' => $role]);
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

        return $this->redirectToRouteAfterFormPost('admin_roleView', ['roleId' => $roleId]);
    }
}
