<?php
/**
 * File containing the SectionController class.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */

namespace EzSystems\PlatformUIBundle\Controller;

use eZ\Publish\API\Repository\Exceptions\UnauthorizedException;
use Symfony\Component\HttpFoundation\Response;
use EzSystems\PlatformUIBundle\Controller\PjaxController;
use EzSystems\PlatformUIBundle\Helper\SectionHelperInterface;

class SectionController extends PjaxController
{
    /**
     * @var EzSystems\PlatformUIBundle\Helper\SectionHelperInterface
     */
    protected $sectionHelper;

    public function __construct( SectionHelperInterface $sectionHelper )
    {
        $this->sectionHelper = $sectionHelper;
    }

    /**
     * Renders the section list
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function listAction()
    {
        $response = new Response();
        try
        {
            return $this->render(
                'eZPlatformUIBundle:Section:list.html.twig',
                array(
                    'sectionInfoList' => $this->sectionHelper->getSectionList(),
                    'canCreate' => $this->sectionHelper->canCreate(),
                ),
                $response
            );
        }
        catch ( UnauthorizedException $e )
        {
            $response->setStatusCode( $this->getNoAccessStatusCode() );
        }
        return $response;
    }

    /**
     * Renders the view of a section
     * @param int $sectionId
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function viewAction( $sectionId )
    {
        $response = new Response();
        try
        {
            $section = $this->sectionHelper->loadSection( $sectionId );
            $contentCount = $this->sectionHelper->contentCount( $section );
            return $this->render(
                "eZPlatformUIBundle:Section:view.html.twig",
                array(
                    'section' => $section,
                    'contentCount' => $contentCount,
                ),
                $response
            );
        }
        catch ( UnauthorizedException $e )
        {
            $response->setStatusCode( $this->getNoAccessStatusCode() );
        }
        return $response;
    }
}
