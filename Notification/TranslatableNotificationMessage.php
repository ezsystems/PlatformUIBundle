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

/**
 * @property-read array $translationParams
 * @property-read string|null $domain
 * @property-read int|null $number
 */
class TranslatableNotificationMessage extends NotificationMessage
{
    /**
     * An array of parameters for the message.
     *
     * @var array
     */
    public $translationParams = [];

    /**
     * The domain for the message or null to use the default.
     *
     * @var string|null
     */
    public $domain;

    /**
     * The number to use to find the indice of the message.
     * If provided, the message will be translated using TranslatorInterface::transChoice() instead of TranslatorInterface::trans().
     *
     * @var int|null
     */
    public $number;
}
