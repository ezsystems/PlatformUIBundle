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

use eZ\Publish\API\Repository\Exceptions\NotFoundException;
use eZ\Publish\API\Repository\RoleService;
use eZ\Publish\API\Repository\Values\User\RoleDraft;
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

    /**
     * @var RoleService
     */
    private $roleService;

    public function __construct(
        RouterInterface $router,
        NotificationPoolInterface $notificationPool,
        RoleService $roleService
    ) {
        $this->router = $router;
        $this->setNotificationPool($notificationPool);
        $this->roleService = $roleService;
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
        $this->notify('role.notification.draft_saved', [], 'role');
    }

    public function processSaveRole(FormActionEvent $event)
    {
        $event->setResponse(new FormProcessingDoneResponse($this->router->generate('admin_roleList')));
        $this->notify('role.notification.published', [], 'role');
    }

    public function processRemoveDraft(FormActionEvent $event)
    {
        /** @var RoleDraft $roleDraft */
        $roleDraft = $event->getData()->roleDraft;
        // Redirect response will be different if we're dealing with an existing Role,
        // or a newly created one which has been discarded.
        try {
            // This will throw a NotFoundException if a published version doesn't exist for this Role.
            $this->roleService->loadRole($roleDraft->id);
            $response = new FormProcessingDoneResponse(
                $this->router->generate(
                    'admin_roleView',
                    ['roleId' => $roleDraft->id]
                )
            );
        } catch (NotFoundException $e) {
            // RoleDraft was newly created, but then discarded.
            // Redirect to the role list view.
            $response = new FormProcessingDoneResponse($this->router->generate('admin_roleList'));
        }

        $event->setResponse($response);
        $this->notify('role.notification.draft_removed', [], 'role');
    }
}
