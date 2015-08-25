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

use eZ\Publish\API\Repository\Exceptions\InvalidArgumentException;
use eZ\Publish\API\Repository\Exceptions\UnauthorizedException;
use eZ\Publish\API\Repository\RoleService;
use EzSystems\PlatformUIBundle\Notification\Notification;
use EzSystems\PlatformUIBundle\Notification\NotificationPoolInterface;
use EzSystems\PlatformUIBundle\Notification\TranslatableNotificationMessage;
use EzSystems\RepositoryForms\Event\FormActionEvent;
use EzSystems\RepositoryForms\Event\RepositoryFormEvents;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\Routing\RouterInterface;

class RoleFormProcessor implements EventSubscriberInterface
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
     * @var RoleService
     */
    private $roleService;

    public function __construct(
        RouterInterface $router,
        NotificationPoolInterface $notificationPool,
        RoleService $roleService
    ) {
        $this->router = $router;
        $this->notificationPool = $notificationPool;
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
        // TODO: When we have role versioning, save draft here.
        // For now, processSaveRole takes care of saving. Follow-up: EZP-24701
        //$this->addNotification('role.notification.draft_saved');
    }

    public function processSaveRole(FormActionEvent $event)
    {
        /** @var \EzSystems\RepositoryForms\Data\RoleData $roleData */
        $roleData = $event->getData();
        $role = $roleData->role;
        try {
            $this->roleService->updateRole($role, $roleData);
            $event->setResponse(
                new RedirectResponse($this->router->generate('admin_roleList'))
            );
            $this->addNotification('role.notification.published');
        } catch (UnauthorizedException $e) {
            $this->addError('role.notification.unauthorized');
        } catch (InvalidArgumentException $e) {
            $this->addError('role.notification.invalid_argument');
        }
    }

    public function processRemoveDraft(FormActionEvent $event)
    {
        $role = $event->getData()->role;
        // TODO: This is just a temporary implementation of draft removal. To be done properly in follow-up: EZP-24701
        if (preg_match('/^__new__[a-z0-9]{32}$/', $role->identifier) === 1) {
            try {
                $this->roleService->deleterole($role);
            } catch (UnauthorizedException $e) {
                $this->addError('role.notification.unauthorized');
            }
        }

        $event->setResponse(
            new RedirectResponse($this->router->generate('admin_roleList'))
        );
    }

    private function addNotification($message)
    {
        $this->notificationPool->addNotification(new TranslatableNotificationMessage([
            'message' => $message,
            'domain' => 'role',
        ]));
    }

    private function addError($message)
    {
        $this->notificationPool->addNotification(
            new TranslatableNotificationMessage([
                'message' => $message,
                'domain' => 'role',
            ]),
            Notification::STATE_ERROR
        );
    }
}
