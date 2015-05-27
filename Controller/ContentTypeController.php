<?php
/**
 * This file is part of the eZ PlatformUI package.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 * @version //autogentag//
 */

namespace EzSystems\PlatformUIBundle\Controller;

use eZ\Bundle\EzPublishCoreBundle\Controller;
use eZ\Publish\API\Repository\ContentTypeService;
use eZ\Publish\API\Repository\Exceptions\NotFoundException;
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
        ActionDispatcherInterface $actionDispatcher,
        FieldTypeFormMapperRegistryInterface $fieldTypeMapperRegistry
    )
    {
        $this->contentTypeService = $contentTypeService;
        $this->actionDispatcher = $actionDispatcher;
        $this->fieldTypeMapperRegistry = $fieldTypeMapperRegistry;
    }

    /**
     * @param array $languages
     */
    public function setPrioritizedLanguages( $languages )
    {
        $this->prioritizedLanguages = $languages;
    }

    public function createContentTypeAction( $contentTypeGroupId, $languageCode = null )
    {
        $languageCode = $languageCode ?: $this->prioritizedLanguages[0];
        $contentTypeGroup = $this->contentTypeService->loadContentTypeGroup( $contentTypeGroupId );

        $contentTypeCreateStruct = new ContentTypeCreateStruct(
            [
                'identifier' => 'new_content_type',
                'mainLanguageCode' => $languageCode,
                'names' => [ $languageCode => 'New ContentType' ],
            ]
        );
        $contentTypeDraft = $this->contentTypeService->createContentType(
            $contentTypeCreateStruct,
            [ $contentTypeGroup ]
        );

        return $this->redirectToRoute(
            'contenttype/update',
            [ 'contentTypeId' => $contentTypeDraft->id, 'languageCode' => $languageCode ]
        );
    }

    public function updateContentTypeAction( Request $request, $contentTypeId, $languageCode = null )
    {
        $languageCode = $languageCode ?: $this->prioritizedLanguages[0];
        // First try to load the draft.
        // If it doesn't exist, create it.
        try
        {
            $contentTypeDraft = $this->contentTypeService->loadContentTypeDraft( $contentTypeId );
        }
        catch ( NotFoundException $e )
        {
            $contentTypeDraft = $this->contentTypeService->createContentTypeDraft(
                $this->contentTypeService->loadContentType( $contentTypeId )
            );
        }

        $contentTypeData = ( new ContentTypeDraftMapper() )->mapToFormData( $contentTypeDraft );
        $form = $this->createForm(
            'ezrepoforms_contenttype_update',
            $contentTypeData, ['languageCode' => $languageCode]
        );

        // Synchronize form and data.
        $form->handleRequest( $request );
        if ( $form->isValid() )
        {
            $this->actionDispatcher->dispatchFormAction(
                $form,
                $contentTypeData,
                $form->getClickedButton()->getName(),
                ['languageCode' => $languageCode]
            );

            if ( $response = $this->actionDispatcher->getResponse() )
            {
                return $response;
            }

            return $this->redirectToRoute(
                'admin_contenttypeUpdate',
                ['contentTypeId' => $contentTypeId, 'languageCode' => $languageCode]
            );
        }

        return $this->render(
            'eZPlatformUIBundle:ContentType:update_content_type.html.twig',
            [
                'form' => $form->createView(),
                'contentTypeName' => $contentTypeDraft->getName( $languageCode ),
                'contentTypeDraft' => $contentTypeDraft,
                'languageCode' => $languageCode,
                'fieldTypeMapperRegistry' => $this->fieldTypeMapperRegistry
            ]
        );
    }
}
