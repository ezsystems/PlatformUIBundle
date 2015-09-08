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
use eZ\Publish\API\Repository\Exceptions\NotFoundException;
use eZ\Publish\API\Repository\SearchService;
use eZ\Publish\API\Repository\UserService;
use eZ\Publish\API\Repository\Values\Content\Query;
use eZ\Publish\Core\MVC\Symfony\Security\Authorization\Attribute;
use eZ\Publish\Core\Repository\Values\ContentType\ContentTypeCreateStruct;
use EzSystems\RepositoryForms\Data\Mapper\ContentTypeDraftMapper;
use EzSystems\RepositoryForms\FieldType\FieldTypeFormMapperRegistryInterface;
use EzSystems\RepositoryForms\Form\ActionDispatcher\ActionDispatcherInterface;
use EzSystems\RepositoryForms\Form\Type\ContentType\ContentTypeCreateType;
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
    private $actionDispatcher;

    /**
     * @var FieldTypeFormMapperRegistryInterface
     */
    private $fieldTypeMapperRegistry;

    private $prioritizedLanguages = [];

    public function __construct(
        ContentTypeService $contentTypeService,
        SearchService $searchService,
        UserService $userService,
        ActionDispatcherInterface $actionDispatcher,
        FieldTypeFormMapperRegistryInterface $fieldTypeMapperRegistry
    ) {
        $this->contentTypeService = $contentTypeService;
        $this->searchService = $searchService;
        $this->userService = $userService;
        $this->actionDispatcher = $actionDispatcher;
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
        return $this->render('eZPlatformUIBundle:ContentType:list_content_type_groups.html.twig', [
            'content_type_groups' => $this->contentTypeService->loadContentTypeGroups(),
            'can_edit' => $this->isGranted(new Attribute('class', 'update')),
        ]);
    }

    public function viewContentTypeGroupAction($contentTypeGroupId)
    {
        $contentTypeGroup = $this->contentTypeService->loadContentTypeGroup($contentTypeGroupId);
        $createForm = $this->createForm(
            new ContentTypeCreateType($this->contentTypeService),
            ['contentTypeGroupId' => $contentTypeGroupId]
        );

        return $this->render('eZPlatformUIBundle:ContentType:view_content_type_group.html.twig', [
            'group' => $contentTypeGroup,
            'content_types' => $this->contentTypeService->loadContentTypes($contentTypeGroup),
            'can_edit' => $this->isGranted(new Attribute('class', 'update')),
            'can_create' => $this->isGranted(new Attribute('class', 'create')),
            'create_form' => $createForm->createView(),
        ]);
    }

    public function editContentTypeGroupAction($contentTypeGroupId)
    {
    }

    public function viewContentTypeAction($contentTypeId, $languageCode = null)
    {
        $languageCode = $languageCode ?: $this->prioritizedLanguages[0];
        $contentType = $this->contentTypeService->loadContentType($contentTypeId);

        $query = new Query([
            'filter' => new Query\Criterion\ContentTypeId($contentTypeId),
            'limit' => 0,
        ]);

        return $this->render('eZPlatformUIBundle:ContentType:view_content_type.html.twig', [
            'language_code' => $languageCode,
            'content_type' => $contentType,
            'content_count' => $this->searchService->findContent($query, [], false)->totalCount,
            'modifier' => $this->userService->loadUser($contentType->modifierId),
            'can_edit' => $this->isGranted(new Attribute('class', 'update')),
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

            return $this->pjaxRedirectToRoute(
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

        return $this->pjaxRedirectToRoute('admin_contenttypeGroupView', ['contentTypeGroupId' => $contentTypeGroupId]);
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
            $this->actionDispatcher->dispatchFormAction(
                $form,
                $contentTypeData,
                $form->getClickedButton()->getName(),
                ['languageCode' => $languageCode]
            );

            if ($response = $this->actionDispatcher->getResponse()) {
                return $response;
            }

            return $this->pjaxRedirect($actionUrl);
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
}
