<?php

/**
 * This file is part of the eZ PlatformUI package.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 *
 * @version //autogentag//
 */
namespace EzSystems\PlatformUIBundle\Controller;

use eZ\Publish\API\Repository\ContentTypeService;
use eZ\Publish\API\Repository\Exceptions\InvalidArgumentException;
use eZ\Publish\API\Repository\Exceptions\NotFoundException;
use eZ\Publish\API\Repository\SearchService;
use eZ\Publish\API\Repository\UserService;
use eZ\Publish\API\Repository\Values\Content\Query;
use eZ\Publish\Core\MVC\Symfony\Security\Authorization\Attribute;
use eZ\Publish\Core\Repository\Values\ContentType\ContentTypeCreateStruct;
use eZ\Publish\Core\Repository\Values\ContentType\ContentTypeGroup;
use EzSystems\RepositoryForms\Data\Mapper\ContentTypeDraftMapper;
use EzSystems\RepositoryForms\Data\Mapper\ContentTypeGroupMapper;
use EzSystems\RepositoryForms\FieldType\FieldTypeFormMapperRegistryInterface;
use EzSystems\RepositoryForms\Form\ActionDispatcher\ActionDispatcherInterface;
use EzSystems\RepositoryForms\Form\Type\ContentType\ContentTypeCreateType;
use EzSystems\RepositoryForms\Form\Type\ContentType\ContentTypeDeleteType;
use EzSystems\RepositoryForms\Form\Type\ContentType\ContentTypeGroupDeleteType;
use EzSystems\RepositoryForms\Form\Type\ContentType\ContentTypeGroupType;
use Symfony\Component\HttpFoundation\Request;

class ContentTypeController extends Controller
{
    /**
     * @var ContentTypeService
     */
    private $contentTypeService;

    /**
     * @var SearchService
     */
    private $searchService;

    /**
     * @var UserService
     */
    private $userService;

    /**
     * @var ActionDispatcherInterface
     */
    private $contentTypeActionDispatcher;

    /**
     * @var ActionDispatcherInterface
     */
    private $contentTypeGroupActionDispatcher;

    /**
     * @var FieldTypeFormMapperRegistryInterface
     */
    private $fieldTypeMapperRegistry;

    private $prioritizedLanguages = [];

    public function __construct(
        ContentTypeService $contentTypeService,
        SearchService $searchService,
        UserService $userService,
        ActionDispatcherInterface $contentTypeGroupActionDispatcher,
        ActionDispatcherInterface $contentTypeActionDispatcher,
        FieldTypeFormMapperRegistryInterface $fieldTypeMapperRegistry
    ) {
        $this->contentTypeService = $contentTypeService;
        $this->searchService = $searchService;
        $this->userService = $userService;
        $this->contentTypeGroupActionDispatcher = $contentTypeGroupActionDispatcher;
        $this->contentTypeActionDispatcher = $contentTypeActionDispatcher;
        $this->fieldTypeMapperRegistry = $fieldTypeMapperRegistry;
    }

    /**
     * @param array $languages
     */
    public function setPrioritizedLanguages($languages)
    {
        $this->prioritizedLanguages = $languages;
    }

    public function listContentTypeGroupsAction()
    {
        $contentTypeGroups = $this->contentTypeService->loadContentTypeGroups();
        $deleteFormsById = [];
        foreach ($contentTypeGroups as $contentTypeGroup) {
            $id = $contentTypeGroup->id;
            $deleteFormsById[$id] = $this->createForm(
                new ContentTypeGroupDeleteType(),
                ['contentTypeGroupId' => $id]
            )->createView();
        }

        return $this->render('eZPlatformUIBundle:ContentType:list_content_type_groups.html.twig', [
            'content_type_groups' => $contentTypeGroups,
            'delete_forms_by_id' => $deleteFormsById,
            'can_edit' => $this->isGranted(new Attribute('class', 'update')),
            'can_delete' => $this->isGranted(new Attribute('class', 'delete')),
        ]);
    }

    public function viewContentTypeGroupAction($contentTypeGroupId)
    {
        $contentTypeGroup = $this->contentTypeService->loadContentTypeGroup($contentTypeGroupId);
        $createForm = $this->createForm(
            new ContentTypeCreateType($this->contentTypeService),
            ['contentTypeGroupId' => $contentTypeGroupId]
        );
        $contentTypes = $this->contentTypeService->loadContentTypes($contentTypeGroup);
        $canDelete = $this->isGranted(new Attribute('class', 'delete'));
        $deleteFormsById = [];
        $canDeleteById = [];

        foreach ($contentTypes as $contentType) {
            $contentTypeId = $contentType->id;
            $deleteFormsById[$contentTypeId] = $this->createForm(
                new ContentTypeDeleteType(),
                ['contentTypeId' => $contentTypeId]
            )->createView();

            $countQuery = new Query(['filter' => new Query\Criterion\ContentTypeId($contentTypeId), 'limit' => 0]);
            $contentCount = $this->searchService->findContent($countQuery, [], false)->totalCount;
            $canDeleteById[$contentTypeId] = $canDelete && $contentCount == 0;
        }

        return $this->render('eZPlatformUIBundle:ContentType:view_content_type_group.html.twig', [
            'group' => $contentTypeGroup,
            'content_types' => $contentTypes,
            'can_edit' => $this->isGranted(new Attribute('class', 'update')),
            'can_create' => $this->isGranted(new Attribute('class', 'create')),
            'can_delete_by_id' => $canDeleteById,
            'create_form' => $createForm->createView(),
            'delete_forms_by_id' => $deleteFormsById,
        ]);
    }

    public function editContentTypeGroupAction(Request $request, $contentTypeGroupId = null)
    {
        if ($contentTypeGroupId) {
            $contentTypeGroup = $this->contentTypeService->loadContentTypeGroup($contentTypeGroupId);
        } else {
            $contentTypeGroup = new ContentTypeGroup(['identifier' => '__new__' . md5(microtime(true))]);
        }

        $data = (new ContentTypeGroupMapper())->mapToFormData($contentTypeGroup);
        $actionUrl = $this->generateUrl('admin_contenttypeGroupEdit', ['contentTypeGroupId' => $contentTypeGroupId]);
        $form = $this->createForm(new ContentTypeGroupType(), $data);
        $form->handleRequest($request);
        if ($form->isValid()) {
            $this->contentTypeGroupActionDispatcher->dispatchFormAction(
                $form,
                $data,
                $form->getClickedButton() ? $form->getClickedButton()->getName() : null
            );
            if ($response = $this->contentTypeGroupActionDispatcher->getResponse()) {
                return $response;
            }

            return $this->redirectAfterFormPost($actionUrl);
        }

        return $this->render('eZPlatformUIBundle:ContentType:edit_content_type_group.html.twig', [
            'form' => $form->createView(),
            'contentTypeGroup' => $data,
            'actionUrl' => $actionUrl,
        ]);
    }

    public function deleteContentTypeGroupAction(Request $request, $contentTypeGroupId)
    {
        $contentTypeGroup = $this->contentTypeService->loadContentTypeGroup($contentTypeGroupId);
        $deleteForm = $this->createForm(new ContentTypeGroupDeleteType(), ['contentTypeGroupId' => $contentTypeGroupId]);
        $deleteForm->handleRequest($request);
        if ($deleteForm->isValid()) {
            try {
                $this->contentTypeService->deleteContentTypeGroup($contentTypeGroup);
                $this->notify('content_type.group.deleted', ['%identifier%' => $contentTypeGroup->identifier], 'content_type');
            } catch (InvalidArgumentException $e) {
                $this->notifyError(
                    'content_type.group.cannot_delete.has_content_types',
                    ['%identifier%' => $contentTypeGroup->identifier],
                    'content_type'
                );
            }

            $this->redirectToRouteAfterFormPost('admin_contenttypeGroupList');
        }

        // Form validation failed. Send errors as notifications.
        foreach ($deleteForm->getErrors(true) as $error) {
            $this->notifyErrorPlural(
                $error->getMessageTemplate(),
                $error->getMessagePluralization(),
                $error->getMessageParameters(),
                'ezrepoforms_content_type'
            );
        }

        return $this->redirectToRouteAfterFormPost('admin_contenttypeGroupList');
    }

    public function viewContentTypeAction($contentTypeId, $languageCode = null)
    {
        $languageCode = $languageCode ?: $this->prioritizedLanguages[0];
        $contentType = $this->contentTypeService->loadContentType($contentTypeId);
        $countQuery = new Query([
            'filter' => new Query\Criterion\ContentTypeId($contentTypeId),
            'limit' => 0,
        ]);
        $contentCount = $this->searchService->findContent($countQuery, [], false)->totalCount;
        $deleteForm = $this->createForm(new ContentTypeDeleteType(), ['contentTypeId' => $contentTypeId]);

        return $this->render('eZPlatformUIBundle:ContentType:view_content_type.html.twig', [
            'language_code' => $languageCode,
            'content_type' => $contentType,
            'content_count' => $contentCount,
            'modifier' => $this->userService->loadUser($contentType->modifierId),
            'delete_form' => $deleteForm->createView(),
            'can_edit' => $this->isGranted(new Attribute('class', 'update')),
            'can_delete' => ($this->isGranted(new Attribute('class', 'delete')) && $contentCount == 0),
        ]);
    }

    public function createContentTypeAction(Request $request, $contentTypeGroupId, $languageCode = null)
    {
        $createForm = $this->createForm(new ContentTypeCreateType($this->contentTypeService), ['contentTypeGroupId' => $contentTypeGroupId]);
        $createForm->handleRequest($request);
        if ($createForm->isValid()) {
            $languageCode = $languageCode ?: $this->prioritizedLanguages[0];
            $contentTypeGroup = $this->contentTypeService->loadContentTypeGroup($createForm->getData()['contentTypeGroupId']);

            $contentTypeCreateStruct = new ContentTypeCreateStruct([
                'identifier' => '__new__' . md5(microtime(true)),
                'mainLanguageCode' => $languageCode,
                'names' => [$languageCode => 'New ContentType'],
            ]);
            $contentTypeDraft = $this->contentTypeService->createContentType(
                $contentTypeCreateStruct,
                [$contentTypeGroup]
            );

            return $this->redirectToRouteAfterFormPost(
                'admin_contenttypeUpdate',
                ['contentTypeId' => $contentTypeDraft->id, 'languageCode' => $languageCode]
            );
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

        return $this->redirectToRouteAfterFormPost('admin_contenttypeGroupView', ['contentTypeGroupId' => $contentTypeGroupId]);
    }

    public function updateContentTypeAction(Request $request, $contentTypeId, $languageCode = null)
    {
        $languageCode = $languageCode ?: $this->prioritizedLanguages[0];
        // First try to load the draft.
        // If it doesn't exist, create it.
        try {
            $contentTypeDraft = $this->contentTypeService->loadContentTypeDraft($contentTypeId);
        } catch (NotFoundException $e) {
            $contentTypeDraft = $this->contentTypeService->createContentTypeDraft(
                $this->contentTypeService->loadContentType($contentTypeId)
            );
        }

        $contentTypeData = (new ContentTypeDraftMapper())->mapToFormData($contentTypeDraft);
        $form = $this->createForm(
            'ezrepoforms_contenttype_update',
            $contentTypeData,
            ['languageCode' => $languageCode]
        );
        $actionUrl = $this->generateUrl(
            'admin_contenttypeUpdate',
            ['contentTypeId' => $contentTypeId, 'languageCode' => $languageCode]
        );

        // Synchronize form and data.
        $form->handleRequest($request);
        $hasErrors = false;
        if ($form->isValid()) {
            $this->contentTypeActionDispatcher->dispatchFormAction(
                $form,
                $contentTypeData,
                $form->getClickedButton() ? $form->getClickedButton()->getName() : null,
                ['languageCode' => $languageCode]
            );

            if ($response = $this->contentTypeActionDispatcher->getResponse()) {
                return $response;
            }

            return $this->redirectAfterFormPost($actionUrl);
        } elseif ($form->isSubmitted()) {
            $hasErrors = true;
        }

        return $this->render('eZPlatformUIBundle:ContentType:update_content_type.html.twig', [
            'form' => $form->createView(),
            'action_url' => $actionUrl,
            'contentTypeName' => $contentTypeDraft->getName($languageCode),
            'contentTypeDraft' => $contentTypeDraft,
            'modifier' => $this->userService->loadUser($contentTypeDraft->modifierId),
            'languageCode' => $languageCode,
            'hasErrors' => $hasErrors,
        ]);
    }

    public function deleteContentTypeAction(Request $request, $contentTypeId)
    {
        $contentType = $this->contentTypeService->loadContentType($contentTypeId);
        $deleteForm = $this->createForm(new ContentTypeDeleteType(), ['contentTypeId' => $contentTypeId]);
        $deleteForm->handleRequest($request);
        if ($deleteForm->isValid()) {
            $this->contentTypeService->deleteContentType($contentType);
            $this->notify(
                'content_type.notification.deleted',
                ['%contentTypeName%' => $contentType->getName($contentType->mainLanguageCode)],
                'content_type'
            );

            return $this->redirectToRouteAfterFormPost(
                'admin_contenttypeGroupView',
                ['contentTypeGroupId' => $contentType->getContentTypeGroups()[0]->id]
            );
        }

        // Form validation failed. Send errors as notifications.
        foreach ($deleteForm->getErrors(true) as $error) {
            $this->notifyErrorPlural(
                $error->getMessageTemplate(),
                $error->getMessagePluralization(),
                $error->getMessageParameters(),
                'ezrepoforms_content_type'
            );
        }

        return $this->redirectToRouteAfterFormPost('admin_contenttypeView', ['contentTypeId' => $contentTypeId]);
    }
}
