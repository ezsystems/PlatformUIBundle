<?php

/**
 * File containing the LanguageController class.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle\Controller;

use eZ\Publish\API\Repository\LanguageService;
use eZ\Publish\API\Repository\Values\Content\Language;
use eZ\Publish\Core\MVC\Symfony\Security\Authorization\Attribute;
use EzSystems\RepositoryForms\Data\Mapper\LanguageMapper;
use EzSystems\RepositoryForms\Form\ActionDispatcher\ActionDispatcherInterface;
use EzSystems\RepositoryForms\Form\Type\Language\LanguageDeleteType;
use EzSystems\RepositoryForms\Form\Type\Language\LanguageType;
use Symfony\Component\HttpFoundation\Request;

class LanguageController extends Controller
{
    /**
     * @var \eZ\Publish\API\Repository\LanguageService
     */
    protected $languageService;

    /**
     * @var ActionDispatcherInterface
     */
    private $actionDispatcher;

    public function __construct(
        ActionDispatcherInterface $actionDispatcher,
        LanguageService $languageService
    ) {
        $this->actionDispatcher = $actionDispatcher;
        $this->languageService = $languageService;
    }

    /**
     * Renders the language list.
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function listAction()
    {
        $languageList = $this->languageService->loadLanguages();
        $deleteFormsByLanguageId = [];

        foreach ($languageList as $language) {
            $languageId = $language->id;
            $deleteFormsByLanguageId[$languageId] = $this->createForm(
                new LanguageDeleteType($this->languageService),
                ['languageId' => $languageId]
            )->createView();
        }

        return $this->render('eZPlatformUIBundle:Language:list.html.twig', [
            'canEdit' => $this->isGranted(new Attribute('language', 'edit')),
            'canAssign' => $this->isGranted(new Attribute('language', 'assign')),
            'languageList' => $languageList,
            'deleteFormsByLanguageId' => $deleteFormsByLanguageId,
        ]);
    }

    /**
     * Renders the view of a language.
     *
     * @param mixed $languageId
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function viewAction($languageId)
    {
        $language = $this->languageService->loadLanguageById($languageId);
        $deleteForm = $this->createForm(new LanguageDeleteType($this->languageService), ['languageId' => $languageId]);

        return $this->render('eZPlatformUIBundle:Language:view.html.twig', [
            'language' => $language,
            'deleteForm' => $deleteForm->createView(),
            'canEdit' => $this->isGranted(new Attribute('language', 'edit')),
            'canAssign' => $this->isGranted(new Attribute('language', 'assign')),
        ]);
    }

    /**
     * Deletes a language.
     *
     * @param mixed $languageId
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function deleteAction(Request $request, $languageId, $redirectErrorsTo = 'list')
    {
        $language = $this->languageService->loadLanguageById($languageId);
        $deleteForm = $this->createForm(new LanguageDeleteType($this->languageService), ['languageId' => $languageId]);
        $deleteForm->handleRequest($request);
        if ($deleteForm->isValid()) {
            $this->languageService->deleteLanguage($language);
            $this->notify('language.deleted', ['%languageName%' => $language->name], 'language');

            return $this->redirectToRouteAfterFormPost('admin_languagelist');
        }

        // Form validation failed. Send errors as notifications.
        foreach ($deleteForm->getErrors(true) as $error) {
            $this->notifyErrorPlural(
                $error->getMessageTemplate(),
                $error->getMessagePluralization(),
                $error->getMessageParameters(),
                'ezrepoforms_language'
            );
        }

        return $this->redirectToRouteAfterFormPost("admin_language{$redirectErrorsTo}", ['languageId' => $languageId]);
    }

    /**
     * Displays the edit form and processes it once submitted.
     *
     * @param \Symfony\Component\HttpFoundation\Request $request
     * @param mixed $languageId
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function editAction(Request $request, $languageId = null)
    {
        $language = $languageId ? $this->languageService->loadLanguageById($languageId) : new Language([
            'languageCode' => '__new__' . md5(microtime(true)),
            'name' => 'New language',
        ]);
        $languageData = (new LanguageMapper())->mapToFormData($language);
        $actionUrl = $this->generateUrl('admin_languageedit', ['languageId' => $languageId]);
        $form = $this->createForm(new LanguageType(), $languageData);
        $form->handleRequest($request);
        if ($form->isValid()) {
            $this->actionDispatcher->dispatchFormAction(
                $form,
                $languageData,
                $form->getClickedButton() ? $form->getClickedButton()->getName() : null
            );
            if ($response = $this->actionDispatcher->getResponse()) {
                return $response;
            }

            return $this->redirectAfterFormPost($actionUrl);
        }

        return $this->render('eZPlatformUIBundle:Language:edit.html.twig', [
            'form' => $form->createView(),
            'actionUrl' => $actionUrl,
            'language' => $languageData,
        ]);
    }
}
