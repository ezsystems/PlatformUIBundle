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

use EzSystems\PlatformUIBundle\Http\FormProcessingDoneResponse;
use EzSystems\PlatformUIBundle\Notification\NotificationPoolAware;
use EzSystems\PlatformUIBundle\Notification\NotificationPoolInterface;
use EzSystems\RepositoryForms\Event\FormActionEvent;
use EzSystems\RepositoryForms\Event\RepositoryFormEvents;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\Routing\RouterInterface;

class RoleFormProcessor implements EventSubscriberInterface
{
    use NotificationPoolAware;

    /**
     * @var RouterInterface
     */
    private $router;

    public function __construct(RouterInterface $router, NotificationPoolInterface $notificationPool)
    {
        $this->router = $router;
        $this->setNotificationPool($notificationPool);
    }

    public static function getSubscribedEvents()
    {
        return [
            RepositoryFormEvents::ROLE_UPDATE => ['processDefaultAction', -10],
            RepositoryFormEvents::ROLE_SAVE => ['processSaveRole', -10],
            RepositoryFormEvents::ROLE_REMOVE_DRAFT => ['processRemoveDraft', -10],
        ];
    }

    public function processDefaultAction(FormActionEvent $event)
    {
        // TODO: When we have role versioning, save draft here.
        // For now, processSaveRole takes care of saving. Follow-up: EZP-24701
        //$this->addNotification('role.notification.draft_saved');
    }

    public function processSaveRole(FormActionEvent $event)
    {
        $event->setResponse(new FormProcessingDoneResponse($this->router->generate('admin_roleList')));
        $this->notify('role.notification.published', [], 'role');
    }

    public function processRemoveDraft(FormActionEvent $event)
    {
        $role = $event->getData()->role;
        // TODO: This is just a temporary implementation of draft removal. To be done properly in follow-up: EZP-24701
        if (preg_match('/^__new__[a-z0-9]{32}$/', $role->identifier) === 1) {
            $this->notify('role.notification.draft_removed', [], 'role');
        }

        $event->setResponse(
            new FormProcessingDoneResponse($this->router->generate('admin_roleList'))
        );
    }
}
