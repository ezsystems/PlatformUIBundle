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
use EzSystems\PlatformUIBundle\Http\FormProcessingDoneResponse;
use EzSystems\PlatformUIBundle\Notification\NotificationPoolAware;
use EzSystems\PlatformUIBundle\Notification\NotificationPoolInterface;
use EzSystems\RepositoryForms\Event\FormActionEvent;
use EzSystems\RepositoryForms\Event\RepositoryFormEvents;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\Routing\RouterInterface;

class ContentTypeFormProcessor implements EventSubscriberInterface
{
    use NotificationPoolAware;

    /**
     * @var RouterInterface
     */
    private $router;

    /**
     * @var ContentTypeService
     */
    private $contentTypeService;

    public function __construct(RouterInterface $router, NotificationPoolInterface $notificationPool, ContentTypeService $contentTypeService)
    {
        $this->router = $router;
        $this->setNotificationPool($notificationPool);
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
        if ($event->getClickedButton() === 'removeDraft') {
            return;
        }

        $this->notify('content_type.notification.draft_updated', [], 'content_type');
    }

    public function processPublishContentType(FormActionEvent $event)
    {
        $event->setResponse(
            $this->generateRedirectResponse(
                $event->getData()->contentTypeDraft,
                $event->getOption('languageCode')
            )
        );

        $this->notify('content_type.notification.published', [], 'content_type');
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
            $response = new FormProcessingDoneResponse(
                $this->router->generate('admin_contenttypeGroupView', [
                    'contentTypeGroupId' => $contentTypeDraft->contentTypeGroups[0]->id,
                ])
            );
        }

        $event->setResponse($response);
        $this->notify('content_type.notification.draft_removed', [], 'content_type');
    }

    private function generateRedirectResponse(ContentTypeDraft $contentTypeDraft, $languageCode)
    {
        return new FormProcessingDoneResponse($this->router->generate(
            'admin_contenttypeView',
            ['contentTypeId' => $contentTypeDraft->id, 'languageCode' => $languageCode]
        ));
    }
}
