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

use eZ\Bundle\EzPublishCoreBundle\Controller;
use eZ\Publish\API\Repository\ContentService;
use eZ\Publish\API\Repository\ContentTypeService;
use eZ\Publish\API\Repository\Exceptions\BadStateException;
use eZ\Publish\API\Repository\Exceptions\NotFoundException;
use eZ\Publish\API\Repository\Exceptions\UnauthorizedException;
use eZ\Publish\API\Repository\SearchService;
use eZ\Publish\API\Repository\UserService;
use eZ\Publish\API\Repository\Values\Content\Query;
use eZ\Publish\Core\MVC\Symfony\Security\Authorization\Attribute;
use eZ\Publish\Core\Repository\Values\ContentType\ContentTypeCreateStruct;
use EzSystems\RepositoryForms\Data\Mapper\ContentTypeDraftMapper;
use EzSystems\RepositoryForms\FieldType\FieldTypeFormMapperRegistryInterface;
use EzSystems\RepositoryForms\Form\ActionDispatcher\ActionDispatcherInterface;
use Symfony\Component\HttpFoundation\Request;

class ContentTypeController extends Controller
{
    /**
     * @var ContentTypeService
     */
    private $contentTypeService;

    /**
     * @var ContentService For deleting content prior to deleting content type
     */
    private $contentService;

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
        FieldTypeFormMapperRegistryInterface $fieldTypeMapperRegistry,
        ContentService $contentService
    ) {
        $this->contentTypeService = $contentTypeService;
        $this->searchService = $searchService;
        $this->userService = $userService;
        $this->actionDispatcher = $actionDispatcher;
        $this->fieldTypeMapperRegistry = $fieldTypeMapperRegistry;
        $this->contentService = $contentService;
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

        return $this->render('eZPlatformUIBundle:ContentType:view_content_type_group.html.twig', [
            'group' => $contentTypeGroup,
            'content_types' => $this->contentTypeService->loadContentTypes($contentTypeGroup),
            'can_edit' => $this->isGranted(new Attribute('class', 'update')),
            'can_create' => $this->isGranted(new Attribute('class', 'create')),
        ]);
    }

    public function editContentTypeGroupAction($contentTypeGroupId)
    {
    }

    public function viewContentTypeAction($contentTypeId, $languageCode = null)
    {
        $languageCode = $languageCode ?: $this->prioritizedLanguages[0];
        try {
            $contentType = $this->contentTypeService->loadContentType($contentTypeId);
        } catch (UnauthorizedException $e) {
            return $this->forward('eZPlatformUIBundle:Pjax:accessDenied');
        }

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
            'can_remove' => $this->isGranted(new Attribute('class', 'remove')),
        ]);
    }

    public function createContentTypeAction($contentTypeGroupId, $languageCode = null)
    {
        $languageCode = $languageCode ?: $this->prioritizedLanguages[0];
        try {
            $contentTypeGroup = $this->contentTypeService->loadContentTypeGroup($contentTypeGroupId);

            $contentTypeCreateStruct = new ContentTypeCreateStruct([
                'identifier' => 'new_content_type',
                'mainLanguageCode' => $languageCode,
                'names' => [$languageCode => 'New ContentType'],
            ]);
            $contentTypeDraft = $this->contentTypeService->createContentType(
                $contentTypeCreateStruct,
                [$contentTypeGroup]
            );
        } catch (UnauthorizedException $e) {
            return $this->forward('eZPlatformUIBundle:Pjax:accessDenied');
        }

        return $this->redirectToRoute(
            'admin_contenttypeUpdate',
            ['contentTypeId' => $contentTypeDraft->id, 'languageCode' => $languageCode]
        );
    }

    public function updateContentTypeAction(Request $request, $contentTypeId, $languageCode = null)
    {
        $languageCode = $languageCode ?: $this->prioritizedLanguages[0];
        // First try to load the draft.
        // If it doesn't exist, create it.
        try {
            $contentTypeDraft = $this->contentTypeService->loadContentTypeDraft($contentTypeId);
        } catch (NotFoundException $e) {
            try {
                $contentTypeDraft = $this->contentTypeService->createContentTypeDraft(
                    $this->contentTypeService->loadContentType($contentTypeId)
                );
            } catch (UnauthorizedException $e) {
                return $this->forward('eZPlatformUIBundle:Pjax:accessDenied');
            }
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

            return $this->redirect($actionUrl);
        }

        return $this->render('eZPlatformUIBundle:ContentType:update_content_type.html.twig', [
            'form' => $form->createView(),
            'action_url' => $actionUrl,
            'contentTypeName' => $contentTypeDraft->getName($languageCode),
            'contentTypeDraft' => $contentTypeDraft,
            'languageCode' => $languageCode,
        ]);
    }

    /**
     * Remove content type.
     *
     * TODO: Ask for confirmation: 'Are you really sure?' & warn: 'This will remove `$contentCount` content instances'.
     * Handle this in PlatformUI?
     *
     * @param int $contentTypeId ID of content type to remove
     */
    public function removeContentTypeAction($contentTypeId)
    {
        try {
            $contentType = $this->contentTypeService->loadContentType($contentTypeId);
        } catch (UnauthorizedException $e) {
            return $this->forward('eZPlatformUIBundle:Pjax:accessDenied');
        }

        // We just need one, doesn't matter which one. Used for redirecting to group view after deletion.
        $contentTypeGroup = $contentType->getContentTypeGroups()[0];

        $query = new Query([
            'filter' => new Query\Criterion\ContentTypeId($contentTypeId),
        ]);
        $contentList = $this->searchService->findContent($query, [], false);
        $contentCount = $contentList->totalCount;

        if ($contentCount > 0) {
            foreach ($contentList->searchHits as $searchHit) {
                try {
                    $this->contentService->deleteContent($searchHit->valueObject->contentInfo);
                } catch (UnauthorizedException $e) {
                    // If the user is not allowed to delete the content (in one of the locations of the content object)
                    return $this->forward('eZPlatformUIBundle:Pjax:accessDenied');
                }
            }
        }

        try {
            $this->contentTypeService->deleteContentType($contentType);
        } catch (BadStateException $e) {
            // If there exist content objects of this type. This should not happen, as we deleted them above,
            // unless we hit a race condition.
            return $this->forward('eZPlatformUIBundle:Pjax:accessDenied'); // This is wrong, use something else TODO
        } catch (UnauthorizedException $e) {
            // If the user is not allowed to delete a content type
            return $this->forward('eZPlatformUIBundle:Pjax:accessDenied');
        }

        return $this->redirectToRoute(
            'admin_contenttypeGroupView',
            ['contentTypeGroupId' => $contentTypeGroup->id]
        );
    }
}
