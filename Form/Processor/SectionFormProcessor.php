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

class SectionFormProcessor implements EventSubscriberInterface
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
            RepositoryFormEvents::SECTION_UPDATE => 'processUpdate',
        ];
    }

    public function processUpdate(FormActionEvent $event)
    {
        /** @var \EzSystems\RepositoryForms\Data\Section\SectionUpdateData|\EzSystems\RepositoryForms\Data\Section\SectionCreateData $sectionData */
        $sectionData = $event->getData();
        if ($sectionData->isNew()) {
            $this->notify('section.notification.created', ['%sectionName%' => $sectionData->name], 'section');
        } else {
            $this->notify('section.notification.updated', ['%sectionName%' => $sectionData->name], 'section');
        }

        $event->setResponse(
            new FormProcessingDoneResponse($this->router->generate('admin_sectionview', ['sectionId' => $sectionData->getId()]))
        );
    }
}
