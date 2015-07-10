<?php
/**
 * This file is part of the eZ PlatformUI package.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 * @version //autogentag//
 */

namespace EzSystems\PlatformUIBundle\Form\Processor;

use EzSystems\PlatformUIBundle\Notification\NotificationPoolInterface;
use EzSystems\PlatformUIBundle\Notification\TranslatableNotificationMessage;
use EzSystems\RepositoryForms\Event\FormActionEvent;
use EzSystems\RepositoryForms\Event\RepositoryFormEvents;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\Routing\RouterInterface;

class SectionFormProcessor implements EventSubscriberInterface
{
    /**
     * @var NotificationPoolInterface
     */
    private $notificationPool;

    /**
     * @var RouterInterface
     */
    private $router;

    public function __construct(NotificationPoolInterface $notificationPool, RouterInterface $router)
    {
        $this->notificationPool = $notificationPool;
        $this->router = $router;
    }

    public static function getSubscribedEvents()
    {
        return [
            RepositoryFormEvents::SECTION_UPDATE => 'processUpdate',
            RepositoryFormEvents::SECTION_CANCEL => 'processCancel',
        ];
    }

    public function processUpdate(FormActionEvent $event)
    {
        /** @var \EzSystems\RepositoryForms\Data\SectionData $sectionData */
        $sectionData = $event->getData();
        if ($sectionData->isNew()) {
            $this->addNotification('section.notification.created', ['%sectionName%' => $sectionData->name]);
        } else {
            $this->addNotification('section.notification.updated', ['%sectionName%' => $sectionData->name]);
        }

        $event->setResponse(
            new RedirectResponse(
                $this->router->generate('admin_sectionview', ['sectionId' => $sectionData->getId()])
            )
        );
    }

    public function processCancel(FormActionEvent $event)
    {
        /** @var \EzSystems\RepositoryForms\Data\SectionData $sectionData */
        $sectionData = $event->getData();
        if ($sectionData->isNew()) {
            $this->addNotification('section.notification.draft_removed');
            $event->setResponse(new RedirectResponse($this->router->generate('admin_sectionlist')));
        } else {
            $event->setResponse(
                new RedirectResponse(
                    $this->router->generate('admin_sectionview', ['sectionId' => $sectionData->getId()])
                )
            );
        }
    }

    private function addNotification($message, array $params = [])
    {
        $this->notificationPool->addNotification(new TranslatableNotificationMessage([
            'message' => $message,
            'translationParams' => $params,
            'domain' => 'section'
        ]));
    }
}
