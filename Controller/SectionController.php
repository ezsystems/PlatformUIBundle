<?php

/**
 * File containing the SectionController class.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle\Controller;

use eZ\Publish\API\Repository\SectionService;
use eZ\Publish\API\Repository\Values\Content\Section;
use eZ\Publish\Core\MVC\Symfony\Security\Authorization\Attribute;
use EzSystems\RepositoryForms\Data\Mapper\SectionMapper;
use EzSystems\RepositoryForms\Form\ActionDispatcher\ActionDispatcherInterface;
use EzSystems\RepositoryForms\Form\Type\Section\SectionDeleteType;
use EzSystems\RepositoryForms\Form\Type\Section\SectionType;
use Symfony\Component\HttpFoundation\Request;

class SectionController extends Controller
{
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
        SectionService $sectionService
    ) {
        $this->actionDispatcher = $actionDispatcher;
        $this->sectionService = $sectionService;
    }

    /**
     * Renders the section list.
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function listAction()
    {
        $sectionList = $this->sectionService->loadSections();
        $contentCountBySectionId = [];
        $deletableSections = [];
        $deleteFormsBySectionId = [];

        foreach ($sectionList as $section) {
            $sectionId = $section->id;
            $contentCountBySectionId[$sectionId] = $this->sectionService->countAssignedContents($section);
            if (!$this->sectionService->isSectionUsed($section)) {
                $deletableSections[$sectionId] = true;
            }
            $deleteFormsBySectionId[$sectionId] = $this->createForm(
                new SectionDeleteType($this->sectionService),
                ['sectionId' => $sectionId]
            )->createView();
        }

        return $this->render('eZPlatformUIBundle:Section:list.html.twig', [
            'canEdit' => $this->isGranted(new Attribute('section', 'edit')),
            'canAssign' => $this->isGranted(new Attribute('section', 'assign')),
            'sectionList' => $sectionList,
            'contentCountBySectionId' => $contentCountBySectionId,
            'deletableSections' => $deletableSections,
            'deleteFormsBySectionId' => $deleteFormsBySectionId,
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
        $section = $this->sectionService->loadSection($sectionId);
        $deleteForm = $this->createForm(new SectionDeleteType($this->sectionService), ['sectionId' => $sectionId]);

        return $this->render('eZPlatformUIBundle:Section:view.html.twig', [
            'section' => $section,
            'deleteForm' => $deleteForm->createView(),
            'contentCount' => $this->sectionService->countAssignedContents($section),
            'deletable' => !$this->sectionService->isSectionUsed($section),
            'canEdit' => $this->isGranted(new Attribute('section', 'edit')),
            'canAssign' => $this->isGranted(new Attribute('section', 'assign')),
        ]);
    }

    /**
     * Deletes a section.
     *
     * @param mixed $sectionId
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function deleteAction(Request $request, $sectionId, $redirectErrorsTo = 'list')
    {
        $section = $this->sectionService->loadSection($sectionId);
        $deleteForm = $this->createForm(new SectionDeleteType($this->sectionService), ['sectionId' => $sectionId]);
        $deleteForm->handleRequest($request);
        if ($deleteForm->isValid()) {
            $this->sectionService->deleteSection($section);
            $this->notify('section.deleted', ['%sectionName%' => $section->name], 'section');

            return $this->redirectToRouteAfterFormPost('admin_sectionlist');
        }

        // Form validation failed. Send errors as notifications.
        foreach ($deleteForm->getErrors(true) as $error) {
            $this->notifyErrorPlural(
                $error->getMessageTemplate(),
                $error->getMessagePluralization(),
                $error->getMessageParameters(),
                'ezrepoforms_section'
            );
        }

        return $this->redirectToRouteAfterFormPost("admin_section{$redirectErrorsTo}", ['sectionId' => $sectionId]);
    }

    /**
     * Displays the edit form and processes it once submitted.
     *
     * @param \Symfony\Component\HttpFoundation\Request $request
     * @param mixed $sectionId
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function editAction(Request $request, $sectionId = null)
    {
        $section = $sectionId ? $this->sectionService->loadSection($sectionId) : new Section([
            'identifier' => '__new__' . md5(microtime(true)),
            'name' => 'New section',
        ]);
        $sectionData = (new SectionMapper())->mapToFormData($section);
        $actionUrl = $this->generateUrl('admin_sectionedit', ['sectionId' => $sectionId]);
        $form = $this->createForm(new SectionType(), $sectionData);
        $form->handleRequest($request);
        if ($form->isValid()) {
            $this->actionDispatcher->dispatchFormAction(
                $form,
                $sectionData,
                $form->getClickedButton() ? $form->getClickedButton()->getName() : null
            );
            if ($response = $this->actionDispatcher->getResponse()) {
                return $response;
            }

            return $this->redirectAfterFormPost($actionUrl);
        }

        return $this->render('eZPlatformUIBundle:Section:edit.html.twig', [
            'form' => $form->createView(),
            'actionUrl' => $actionUrl,
            'section' => $sectionData,
        ]);
    }
}
