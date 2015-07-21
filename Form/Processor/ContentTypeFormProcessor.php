<?php

/**
 * This file is part of the eZ PlatformUI package.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 *
 * @version //autogentag//
 */

namespace EzSystems\PlatformUIBundle\Form\Processor;

use eZ\Publish\API\Repository\ContentTypeService;
use eZ\Publish\API\Repository\Exceptions\NotFoundException;
use eZ\Publish\API\Repository\Values\ContentType\ContentTypeDraft;
use EzSystems\PlatformUIBundle\Notification\NotificationPoolInterface;
use EzSystems\PlatformUIBundle\Notification\TranslatableNotificationMessage;
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

    /**
     * @var NotificationPoolInterface
     */
    private $notificationPool;

    /**
     * @var ContentTypeService
     */
    private $contentTypeService;

    public function __construct(RouterInterface $router, NotificationPoolInterface $notificationPool, ContentTypeService $contentTypeService)
    {
        $this->router = $router;
        $this->notificationPool = $notificationPool;
        $this->contentTypeService = $contentTypeService;
    }

    public static function getSubscribedEvents()
    {
        return [
            RepositoryFormEvents::CONTENT_TYPE_UPDATE => ['processDefaultAction', -10],
            RepositoryFormEvents::CONTENT_TYPE_PUBLISH => ['processPublishContentType', -10],
            RepositoryFormEvents::CONTENT_TYPE_REMOVE_DRAFT => ['processRemoveContentTypeDraft', -10],
        ];
    }

    public function processDefaultAction(FormActionEvent $event)
    {
        $this->addNotification('content_type.notification.draft_updated');
    }

    public function processPublishContentType(FormActionEvent $event)
    {
        $event->setResponse(
            $this->generateRedirectResponse(
                $event->getData()->contentTypeDraft,
                $event->getOption('languageCode')
            )
        );

        $this->addNotification('content_type.notification.published');
    }

    public function processRemoveContentTypeDraft(FormActionEvent $event)
    {
        /** @var ContentTypeDraft $contentTypeDraft */
        $contentTypeDraft = $event->getData()->contentTypeDraft;
        $languageCode = $event->getOption('languageCode');
        // Redirect response will be different if we're dealing with an existing ContentType or a newly created one, which has been discarded.
        try {
            // This will throw a NotFoundException if a published version doesn't exist for this ContentType.
            $this->contentTypeService->loadContentType($contentTypeDraft->id);
            $response = $this->generateRedirectResponse($contentTypeDraft, $languageCode);
        } catch (NotFoundException $e) {
            // ContentTypeDraft was newly created, but then discarded.
            // Redirect to the ContentTypeGroup view.
            $response = new RedirectResponse(
                $this->router->generate('admin_contenttypeGroupView', [
                    'contentTypeGroupId' => $contentTypeDraft->contentTypeGroups[0]->id,
                ])
            );
        }

        $event->setResponse($response);
        $this->addNotification('content_type.notification.draft_removed');
    }

    private function generateRedirectResponse(ContentTypeDraft $contentTypeDraft, $languageCode)
    {
        $url = $this->router->generate(
            'admin_contenttypeView',
            ['contentTypeId' => $contentTypeDraft->id, 'languageCode' => $languageCode]
        );

        return new RedirectResponse($url);
    }

    private function addNotification($message)
    {
        $this->notificationPool->addNotification(new TranslatableNotificationMessage([
            'message' => $message,
            'domain' => 'content_type',
        ]));
    }
}
