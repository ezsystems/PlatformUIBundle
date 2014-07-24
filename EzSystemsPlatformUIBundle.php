<?php
/**
 * File containing the EzSystemsPlatformUIBundle class.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */

namespace EzSystems\PlatformUIBundle;

use EzSystems\PlatformUIBundle\DependencyInjection\EzPlatformUIExtension;
use Symfony\Component\HttpKernel\Bundle\Bundle;

class EzSystemsPlatformUIBundle extends Bundle
{
    const NAME = "eZPlatformUIBundle";
    protected $name = self::NAME;

    public function getContainerExtension()
    {
        return new EzPlatformUIExtension();
    }
}
