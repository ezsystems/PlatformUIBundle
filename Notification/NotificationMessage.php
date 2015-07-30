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

use eZ\Publish\API\Repository\Values\ValueObject;

/**
 * @property-read string $message
 */
class NotificationMessage extends ValueObject
{
    /**
     * The message id (may also be an object that can be cast to string).
     *
     * @var string
     */
    public $message;
}
