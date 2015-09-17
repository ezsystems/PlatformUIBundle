<?php
/**
 * This file is part of the eZ PlatformUI package.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 * @version //autogentag//
 */
namespace EzSystems\PlatformUIBundle\Form\Processor;

use EzSystems\PlatformUIBundle\Http\FormProcessingDoneResponse;
use EzSystems\PlatformUIBundle\Notification\NotificationPoolAware;
use EzSystems\PlatformUIBundle\Notification\NotificationPoolInterface;
use EzSystems\RepositoryForms\Event\FormActionEvent;
use EzSystems\RepositoryForms\Event\RepositoryFormEvents;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\Routing\RouterInterface;

class ContentTypeGroupFormProcessor implements EventSubscriberInterface
{
    use NotificationPoolAware;

    /**
     * @var RouterInterface
     */
    private $router;

    public function __construct(NotificationPoolInterface $notificationPool, RouterInterface $router)
    {
        $this->setNotificationPool($notificationPool);
        $this->router = $router;
    }

    public static function getSubscribedEvents()
    {
        return [
            RepositoryFormEvents::CONTENT_TYPE_GROUP_UPDATE => ['processUpdate', -10],
        ];
    }

    public function processUpdate(FormActionEvent $event)
    {
        /** @var \EzSystems\RepositoryForms\Data\ContentTypeGroup\ContentTypeGroupUpdateData|\EzSystems\RepositoryForms\Data\ContentTypeGroup\ContentTypeGroupCreateData $data */
        $data = $event->getData();
        if ($data->isNew()) {
            $this->notify('content_type.group.notification.created', ['%identifier%' => $data->identifier], 'content_type');
        } else {
            $this->notify('content_type.group.notification.updated', ['%identifier%' => $data->identifier], 'content_type');
        }

        $event->setResponse(
            new FormProcessingDoneResponse($this->router->generate('admin_contenttypeGroupList'))
        );
    }
}
