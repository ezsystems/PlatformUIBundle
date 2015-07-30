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

interface NotificationPoolInterface
{
    /**
     * Pushes a notification message to the registry.
     *
     * @param NotificationMessage $message The notification message
     * @param string $state The notification state (see Notification::STATE_*)
     */
    public function addNotification(NotificationMessage $message, $state = Notification::STATE_DONE);
}
