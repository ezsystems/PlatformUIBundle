<?php
/**
 * File containing the SubitemsController class.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */

namespace EzSystems\PlatformUIBundle\Controller;

use eZ\Bundle\EzPublishCoreBundle\Controller;
use eZ\Publish\API\Repository\SearchService;
use eZ\Publish\API\Repository\ContentTypeService;
use eZ\Publish\API\Repository\Values\Content\Query;
use eZ\Publish\API\Repository\Values\Content\Query\Criterion;
use Symfony\Component\HttpFoundation\Request;

class SubitemsController extends Controller
{
    /**
     * @var eZ\Publish\API\Repository\SearchService
     */
    private $searchService;

    function __construct( SearchService $searchService, ContentTypeService $contentTypeService )
    {
        $this->searchService = $searchService;
        $this->contentTypeService = $contentTypeService;
    }

    /**
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function listAction( Request $request )
    {
        $query = new Query();
        $query->filter = new Criterion\ParentLocationId(
            $request->get( 'parentLocationId' )
        );
        $result = $this->searchService->findContent( $query );
        $contentsStruct = array();

        foreach ( $result->searchHits as $hit )
        {
            $contentsStruct[] = array(
                'content' => $hit->valueObject,
                'contentType' => $this->contentTypeService->loadContentType(
                    $hit->valueObject->contentInfo->contentTypeId
                ),
            );
        }
        return $this->render(
            'eZPlatformUIBundle:Subitems:list.html.twig',
            array(
                'contentsStruct' => $contentsStruct
            )
        );
    }
}
