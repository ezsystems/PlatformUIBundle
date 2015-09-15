<?php
/**
 * This file is part of the eZ PlatformUI package.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 * @version //autogentag//
 */
namespace EzSystems\PlatformUIBundle\Notification;

/**
 * Trait for PJAX notifications.
 */
trait NotificationPoolAware
{
    /**
     * @var NotificationPoolInterface
     */
    protected $notificationPool;

    public function setNotificationPool(NotificationPoolInterface $notificationPool)
    {
        $this->notificationPool = $notificationPool;
    }

    /**
     * Registers a translatable notification.
     *
     * @param string $message
     * @param array $params Translation parameters to be injected into $message.
     * @param string $domain Translation domain.
     * @param string $status On of Notification::STATE_DONE, Notification::STATE_ERROR, Notification::STATE_STARTED
     */
    protected function notify($message, array $params = [], $domain = null, $status = Notification::STATE_DONE)
    {
        $this->notificationPool->addNotification(
            new TranslatableNotificationMessage([
                'message' => $message,
                'translationParams' => $params,
                'domain' => $domain,
            ]),
            $status
        );
    }

    /**
     * Registers a translatable error notification.
     *
     * @param string $message
     * @param array $params Translation parameters.
     * @param string $domain Translation domain
     */
    protected function notifyError($message, array $params = [], $domain = null)
    {
        $this->notify($message, $params, $domain, Notification::STATE_ERROR);
    }

    /**
     * Same as `notify()`, with pluralization.
     *
     * @param string $message
     * @param int $number
     * @param array $params
     * @param string $domain
     * @param string $status
     */
    protected function notifyPlural(
        $message,
        $number,
        array $params = [],
        $domain = null,
        $status = Notification::STATE_DONE
    ) {
        $this->notificationPool->addNotification(
            new TranslatableNotificationMessage([
                'message' => $message,
                'number' => $number,
                'translationParams' => $params,
                'domain' => $domain,
            ]),
            $status
        );
    }

    /**
     * Same as `notifyError()`, with pluralization.
     *
     * @param string $message
     * @param int $number
     * @param array $params
     * @param string $domain
     */
    protected function notifyErrorPlural($message, $number, array $params = [], $domain = null)
    {
        $this->notifyPlural($message, $number, $params, $domain, Notification::STATE_ERROR);
    }
}
