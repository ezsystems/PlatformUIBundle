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

class LanguageFormProcessor implements EventSubscriberInterface
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
            RepositoryFormEvents::LANGUAGE_UPDATE => 'processUpdate',
        ];
    }

    public function processUpdate(FormActionEvent $event)
    {
        /** @var \EzSystems\RepositoryForms\Data\Language\LanguageUpdateData|\EzSystems\RepositoryForms\Data\Language\LanguageCreateData $languageData */
        $languageData = $event->getData();
        if ($languageData->isNew()) {
            $this->notify('language.notification.created', ['%languageName%' => $languageData->name], 'language');
        } else {
            $this->notify('language.notification.updated', ['%languageName%' => $languageData->name], 'language');
        }

        $event->setResponse(
            new FormProcessingDoneResponse($this->router->generate('admin_languageview', ['languageId' => $languageData->getId()]))
        );
    }
}
