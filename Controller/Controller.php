<?php
/**
 * This file is part of the eZ PlatformUI package.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 * @version //autogentag//
 */
namespace EzSystems\PlatformUIBundle\Controller;

use EzSystems\PlatformUIBundle\Notification\NotificationPoolAware;
use eZ\Bundle\EzPublishCoreBundle\Controller as BaseController;

abstract class Controller extends BaseController
{
    use NotificationPoolAware;
}
