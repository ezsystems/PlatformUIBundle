<?php
/**
 * File containing the CreateContentController class.
 *
 * It's responsible for handling AJAX requests from location view and create content view of PlatformUI
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */

namespace EzSystems\PlatformUIBundle\Controller;

use eZ\Bundle\EzPublishCoreBundle\Controller;
use eZ\Publish\API\Repository\LocationService;
use eZ\Publish\API\Repository\ContentTypeService;
use eZ\Publish\Core\Base\Exceptions\NotFoundException;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Bridge\Monolog\Logger;

class CreateContentController extends Controller
{
    /**
     * @var eZ\Publish\API\Repository\LocationService
     */
    private $locationService;

    /**
     * @var eZ\Publish\API\Repository\ContentTypeService
     */
    private $contentTypeService;

    /**
     * @var Symfony\Bridge\Monolog\Logger
     */
    private $logger;

    public function __construct( LocationService $locationService, ContentTypeService $contentTypeService, Logger $logger = null )
    {
        $this->locationService = $locationService;
        $this->contentTypeService = $contentTypeService;
        $this->logger = $logger;
    }

    /**
     * Returns a list of content types to be usable by the PlatformUI
     * JavaScript code.
     *
     * @return \Symfony\Component\HttpFoundation\JsonResponse
     */
    public function getContentTypesListAction( Request $request )
    {
        $jsonResponse = new JsonResponse();

        if ( !$request->isXmlHttpRequest() )
        {
            return $jsonResponse;
        }

        try
        {
            $responseData = [];
            $contentTypeGroups = $this->contentTypeService->loadContentTypeGroups();

            foreach ($contentTypeGroups as $group)
            {
                $responseData[$group->id]['identifier'] = $group->identifier;
                $responseData['groups'][] = array(
                    'id' => $group->id,
                    'name' => $group->identifier
                );

                foreach ( $this->contentTypeService->loadContentTypes($group) as $type )
                {
                    $typeName = $type->names[$type->mainLanguageCode];

                    $responseData['types'][$typeName] = array(
                        'id' => $type->id,
                        'groupId' => $group->id,
                        'identifier' => $type->identifier,
                        'name' => $typeName,
                        'lang' => $type->mainLanguageCode
                    );
                    $responseData['source'][] = $typeName;
                }
            }

            $jsonResponse->setData( $responseData );
        }
        catch ( NotFoundException $error )
        {
            $jsonResponse->setStatusCode( 404 );
            $jsonResponse->setData( array( 'message' => 'Not found' ) );
            $this->logger->error('@getContentTypesListAction - 404: Not found');
        }

        return $jsonResponse;
    }
}
