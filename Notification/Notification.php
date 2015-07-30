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
 * A notification representation.
 * Typical usage is storing an implementation in the session flash bag, with "notification" identifier.
 * PJax display will automatically detect it and dispatch it to the main notification system.
 *
 * @property-read string $message
 * @property-read string $state
 */
class Notification extends ValueObject
{
    const STATE_DONE = 'done';
    const STATE_ERROR = 'error';
    const STATE_STARTED = 'started';

    /**
     * The notification message.
     *
     * @var string
     */
    protected $message;

    /**
     * The notification state.
     * See STATE_* constants.
     *
     * @var string
     */
    protected $state;
}
