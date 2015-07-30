<?php

/**
 * This file is part of the eZ PlatformUI package.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 *
 * @version //autogentag//
 */
namespace EzSystems\PlatformUIBundle\Notification;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\Session\Session;
use Symfony\Component\HttpKernel\Event\FilterResponseEvent;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\Translation\TranslatorInterface;

class NotificationPool implements NotificationPoolInterface, EventSubscriberInterface
{
    /**
     * @var TranslatorInterface
     */
    private $translator;

    /**
     * @var Session
     */
    private $session;

    /**
     * @var Notification[]
     */
    private $notifications = [];

    public function __construct(TranslatorInterface $translator, Session $session)
    {
        $this->translator = $translator;
        $this->session = $session;
    }

    public static function getSubscribedEvents()
    {
        return [
            KernelEvents::RESPONSE => 'onKernelResponse',
        ];
    }

    public function addNotification(NotificationMessage $message, $state = Notification::STATE_DONE)
    {
        $translatedMessage = $message instanceof TranslatableNotificationMessage ? $this->translateMessage($message) : $message->message;
        $this->notifications[] = new Notification([
            'message' => $translatedMessage,
            'state' => $state,
        ]);
    }

    /**
     * @return Notification[]
     */
    public function getNotifications()
    {
        return $this->notifications;
    }

    private function translateMessage(TranslatableNotificationMessage $message)
    {
        if ($message->number !== null) {
            return $this->translator->transChoice(
                $message->message,
                (int)$message->number,
                $message->translationParams,
                $message->domain
            );
        }

        return $this->translator->trans($message->message, $message->translationParams, $message->domain);
    }

    public function onKernelResponse(FilterResponseEvent $event)
    {
        if ($this->notifications) {
            $this->session->getFlashBag()->set('notification', $this->notifications);
        }
    }
}
