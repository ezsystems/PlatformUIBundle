<?php

/**
 * File containing the SectionController class.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle\Controller;

use eZ\Publish\API\Repository\Exceptions\NotFoundException;
use eZ\Publish\API\Repository\Exceptions\UnauthorizedException;
use eZ\Publish\API\Repository\SectionService;
use eZ\Publish\API\Repository\Values\Content\SectionCreateStruct;
use eZ\Publish\API\Repository\Values\Content\SectionUpdateStruct;
use eZ\Bundle\EzPublishCoreBundle\Controller;
use eZ\Publish\Core\MVC\Symfony\Security\Authorization\Attribute;
use EzSystems\PlatformUIBundle\Entity\SectionList;
use EzSystems\PlatformUIBundle\Form\Type\SectionDeleteType;
use EzSystems\PlatformUIBundle\Form\Type\SectionListType;
use EzSystems\RepositoryForms\Data\Mapper\SectionMapper;
use EzSystems\RepositoryForms\Form\ActionDispatcher\ActionDispatcherInterface;
use EzSystems\RepositoryForms\Form\Type\SectionType;
use Symfony\Component\HttpFoundation\Request;
use EzSystems\PlatformUIBundle\Helper\SectionHelperInterface;
use Symfony\Component\HttpFoundation\Response;

class SectionController extends Controller
{
    /**
     * @var \EzSystems\PlatformUIBundle\Helper\SectionHelperInterface
     */
    protected $sectionHelper;

    /**
     * @var \EzSystems\PlatformUIBundle\Form\Type\SectionListType
     */
    protected $sectionListType;

    /**
     * @var \eZ\Publish\API\Repository\SectionService
     */
    protected $sectionService;

    /**
     * @var ActionDispatcherInterface
     */
    private $actionDispatcher;

    public function __construct(
        ActionDispatcherInterface $actionDispatcher,
        SectionHelperInterface $sectionHelper,
        SectionListType $sectionListType,
        SectionService $sectionService
    ) {
        $this->actionDispatcher = $actionDispatcher;
        $this->sectionHelper = $sectionHelper;
        $this->sectionListType = $sectionListType;
        $this->sectionService = $sectionService;
    }

    /**
     * Renders the section list.
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function listAction()
    {
        try {
            $sectionList = $this->sectionService->loadSections();
            $contentCountBySectionId = [];

            foreach ($sectionList as $section) {
                $contentCountBySectionId[$section->id] = $this->sectionService->countAssignedContents($section);
            }

            return $this->render('eZPlatformUIBundle:Section:list.html.twig', [
                'canEdit' => $this->isGranted(new Attribute('section', 'edit')),
                'canAssign' => $this->isGranted(new Attribute('section', 'assign')),
                'sectionList' => $sectionList,
                'contentCountBySection' => $contentCountBySectionId,
            ]);
        } catch (UnauthorizedException $e) {
            return $this->forward('eZPlatformUIBundle:Pjax:accessDenied');
        }
    }

    /**
     * Deletes sections.
     *
     * @param \Symfony\Component\HttpFoundation\Request $request
     *
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function deleteListAction(Request $request)
    {
        $sectionListToDelete = new SectionList();
        $form = $this->generateDeleteListForm($sectionListToDelete);
        $form->handleRequest($request);

        if ($form->isValid()) {
            $this->sectionHelper->deleteSectionList($sectionListToDelete);
        }

        return $this->redirect($this->generateUrl('admin_sectionlist'));
    }

    /**
     * Generate the form object used to delete sections.
     *
     * @param \EzSystems\PlatformUIBundle\Entity\SectionList $sectionListToDelete sections to be populated/deleted
     *
     * @return \Symfony\Component\Form\Form
     */
    private function generateDeleteListForm(SectionList $sectionListToDelete)
    {
        return $this->createForm($this->sectionListType, $sectionListToDelete, [
            'action' => $this->generateUrl('admin_sectiondeletelist'),
        ]);
    }

    /**
     * Renders the view of a section.
     *
     * @param mixed $sectionId
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function viewAction($sectionId)
    {
        try {
            $section = $this->sectionService->loadSection($sectionId);

            return $this->render('eZPlatformUIBundle:Section:view.html.twig', [
                'section' => $section,
                'contentCount' => $this->sectionService->countAssignedContents($section),
                'canEdit' => $this->isGranted(new Attribute('section', 'edit')),
                'canAssign' => $this->isGranted(new Attribute('section', 'assign')),
            ]);
        } catch (UnauthorizedException $e) {
            return $this->forward('eZPlatformUIBundle:Pjax:accessDenied');
        }
    }

    /**
     * Deletes a section.
     *
     * @param \Symfony\Component\HttpFoundation\Request $request
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function deleteAction($sectionId)
    {
        try {
            $this->sectionService->deleteSection($this->sectionService->loadSection($sectionId));
        } catch (UnauthorizedException $e) {
            return $this->forward('eZPlatformUIBundle:Pjax:accessDenied');
        }

        return $this->redirect($this->generateUrl('admin_sectionlist'));
    }

    public function createAction()
    {
        try {
            $section = $this->sectionService->createSection(new SectionCreateStruct([
                'identifier' => '__new__' . md5(microtime(true)),
                'name' => 'New section',
            ]));
        } catch (UnauthorizedException $e) {
            return $this->forward('eZPlatformUIBundle:Pjax:accessDenied');
        }

        return $this->redirectToRoute('admin_sectionedit', ['sectionId' => $section->id]);
    }

    /**
     * Displays the edit form and processes it once submitted.
     *
     * @param \Symfony\Component\HttpFoundation\Request $request
     * @param mixed $sectionId
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function editAction(Request $request, $sectionId)
    {
        try {
            $sectionData = (new SectionMapper())->mapToFormData($this->sectionService->loadSection($sectionId));
        } catch (UnauthorizedException $e) {
            return $this->forward('eZPlatformUIBundle:Pjax:accessDenied');
        } catch (NotFoundException $e) {
            return $this->render(
                'eZPlatformUIBundle:Section:not_found.html.twig',
                ['sectionId' => $sectionId],
                new Response('', 404)
            );
        }

        $actionUrl = $this->generateUrl('admin_sectionedit', ['sectionId' => $sectionId]);
        $form = $this->createForm(new SectionType(), $sectionData);
        $form->handleRequest($request);
        if ($form->isValid()) {
            try {
                $this->actionDispatcher->dispatchFormAction($form, $sectionData, $form->getClickedButton()->getName());
                if ($response = $this->actionDispatcher->getResponse()) {
                    return $response;
                }

                return $this->redirect($actionUrl);
            } catch (UnauthorizedException $e) {
                return $this->forward('eZPlatformUIBundle:Pjax:accessDenied');
            }
        }

        return $this->render('eZPlatformUIBundle:Section:edit.html.twig', [
            'form' => $form->createView(),
            'actionUrl' => $actionUrl,
            'section' => $sectionData,
        ]);
    }
}
