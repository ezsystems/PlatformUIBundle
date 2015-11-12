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

class PolicyFormProcessor implements EventSubscriberInterface
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
            RepositoryFormEvents::POLICY_UPDATE => ['processDefaultAction', -10],
            RepositoryFormEvents::POLICY_SAVE => ['processSavePolicy', -10],
            RepositoryFormEvents::POLICY_REMOVE_DRAFT => ['processRemoveDraft', -10],
        ];
    }

    public function processDefaultAction(FormActionEvent $event)
    {
        /** @var \EzSystems\RepositoryForms\Data\Role\PolicyCreateData|\EzSystems\RepositoryForms\Data\Role\PolicyUpdateData $data */
        $data = $event->getData();
        $this->notify('role.policy.notification.draft_saved', [], 'role');
        // Set a default redirect response to policy edit route, with the new policy draft ID
        $event->setResponse(
            new FormProcessingDoneResponse(
                $this->router->generate('admin_policyEdit', [
                    'roleId' => $data->initialRole->id,
                    'policyId' => $data->policyDraft->id,
                ])
            )
        );
    }

    public function processSavePolicy(FormActionEvent $event)
    {
        /** @var \EzSystems\RepositoryForms\Data\Role\PolicyCreateData|\EzSystems\RepositoryForms\Data\Role\PolicyUpdateData $data */
        $data = $event->getData();
        $event->setResponse(
            new FormProcessingDoneResponse(
                $this->router->generate('admin_roleView', ['roleId' => $data->initialRole->id])
            )
        );

        $this->notify('role.notification.published', [], 'role');
    }

    public function processRemoveDraft(FormActionEvent $event)
    {
        /** @var \EzSystems\RepositoryForms\Data\Role\PolicyCreateData|\EzSystems\RepositoryForms\Data\Role\PolicyUpdateData $data */
        $data = $event->getData();
        $event->setResponse(
            new FormProcessingDoneResponse(
                $this->router->generate('admin_roleView', ['roleId' => $data->initialRole->id])
            )
        );

        $this->notify('role.policy.notification.draft_removed', [], 'role');
        $this->notify('role.notification.draft_removed', [], 'role');
    }
}
