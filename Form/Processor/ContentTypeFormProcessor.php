<?php
/**
 * This file is part of the eZ PlatformUI package.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 * @version //autogentag//
 */

namespace EzSystems\PlatformUIBundle\Form\Processor;

use eZ\Publish\API\Repository\Values\ContentType\ContentTypeDraft;
use EzSystems\RepositoryForms\Event\FormActionEvent;
use EzSystems\RepositoryForms\Event\RepositoryFormEvents;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\Routing\RouterInterface;

class ContentTypeFormProcessor implements EventSubscriberInterface
{
    /**
     * @var RouterInterface
     */
    private $router;

    public function __construct(RouterInterface $router)
    {
        $this->router = $router;
    }

    public static function getSubscribedEvents()
    {
        return [
            RepositoryFormEvents::CONTENT_TYPE_PUBLISH => ['processPublishContentType', -10],
            RepositoryFormEvents::CONTENT_TYPE_REMOVE_DRAFT => ['processRemoveContentTypeDraft', -10],
        ];
    }

    public function processPublishContentType(FormActionEvent $event)
    {
        $event->setResponse(
            $this->generateRedirectResponse(
                $event->getData()->contentTypeDraft,
                $event->getOption('languageCode')
            )
        );
        // TODO: Add confirmation flash message.
    }

    public function processRemoveContentTypeDraft(FormActionEvent $event)
    {
        $event->setResponse(
            $this->generateRedirectResponse(
                $event->getData()->contentTypeDraft,
                $event->getOption('languageCode')
            )
        );
    }

    private function generateRedirectResponse(ContentTypeDraft $contentTypeDraft, $languageCode)
    {
        $url = $this->router->generate(
            'admin_contenttypeView',
            ['contentTypeId' => $contentTypeDraft->id, 'languageCode' => $languageCode]
        );

        return new RedirectResponse($url);
    }
}
