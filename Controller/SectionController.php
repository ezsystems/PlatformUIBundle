<?php
/**
 * File containing the SectionController class.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */

namespace EzSystems\PlatformUIBundle\Controller;

use eZ\Publish\API\Repository\Exceptions\UnauthorizedException;
use EzSystems\PlatformUIBundle\Entity\SectionUpdateStruct;
use Symfony\Component\HttpFoundation\Response;
use EzSystems\PlatformUIBundle\Controller\PjaxController;
use EzSystems\PlatformUIBundle\Helper\SectionHelperInterface;
use Symfony\Component\HttpFoundation\Request;
use eZ\Publish\API\Repository\SectionService;
use EzSystems\PlatformUIBundle\Entity\SectionCreateStruct;
use EzSystems\PlatformUIBundle\Form\Type\SectionType;

class SectionController extends PjaxController
{
    /**
     * @var \EzSystems\PlatformUIBundle\Helper\SectionHelperInterface
     */
    protected $sectionHelper;
    /**
     * @var \eZ\Publish\API\Repository\SectionService
     */
    protected $sectionService;
    /**
     * @var \EzSystems\PlatformUIBundle\Form\Type\SectionType
     */
    protected $sectionType;

    public function __construct( SectionHelperInterface $sectionHelper, SectionService $sectionService, SectionType $sectionType )
    {
        $this->sectionHelper = $sectionHelper;
        $this->sectionService = $sectionService;
        $this->sectionType = $sectionType;
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

    public function createSectionFormAction()
    {
        // Creating a form using Symfony's form component
        $sectionCreateStruct = new SectionCreateStruct();
        $form = $this->createForm(
            $this->sectionType, $sectionCreateStruct,
            array(
                'action' => $this->get( 'router' )->generate( 'admin_sectioncreate' ),
            )
        );
        $request = $this->getRequest();
        $form->handleRequest( $request );

        if ( $form->isValid() )
        {
            $this->sectionService->createSection( $sectionCreateStruct );
            return $this->render(
                'eZPlatformUIBundle:Section:list.html.twig',
                array(
                    'sectionInfoList' => $this->sectionHelper->getSectionList(),
                    'canCreate' => $this->sectionHelper->canCreate(),
                )
            );
        }
        else
        {
             return $this->render(
                 'eZPlatformUIBundle:Section:createsection.html.twig',
                 array(
                     'form' => $form->createView(),
                 )
             );
        }
    }

    public function editSectionFormAction( $sectionId )
    {
        $sectionCreateStruct = new SectionCreateStruct();
        $sectionUpdateValue = new SectionUpdateStruct();
        $section = $this->sectionHelper->loadSection( $sectionId );
        $sectionCreateStruct->name = $section->name;
        $sectionCreateStruct->identifier = $section->identifier;
        if ( !empty( $_POST ) )
        {
            $sectionUpdateValue->name = $_POST["ezplatformui_section"]["name"];
            $sectionUpdateValue->identifier = $_POST["ezplatformui_section"]["identifier"];
            $this->sectionService->updateSection( $section, $sectionUpdateValue );
            return $this->render(
                'eZPlatformUIBundle:Section:list.html.twig',
                array(
                    'sectionInfoList' => $this->sectionHelper->getSectionList(),
                    'canCreate' => $this->sectionHelper->canCreate(),
                )
            );
        }
        else
        {
            $form = $this->createForm(
                $this->sectionType, $sectionCreateStruct,
                array(
                    'action' => $this->get( 'router' )->generate( 'admin_sectionedit', array( 'sectionId' => $sectionId ) ),
                )
            );
            return $this->render(
                'eZPlatformUIBundle:Section:editsection.html.twig',
                array(
                    'form' => $form->createView(),
                )
            );
        }
    }
}
