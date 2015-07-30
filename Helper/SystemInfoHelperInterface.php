<?php

/**
 * File containing the SystemInfoHelperInterface interface.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle\Helper;

interface SystemInfoHelperInterface
{
    /**
     * Returns information about the system running eZ Publish Platform.
     *
     * @return array
     */
    public function getSystemInfo();

    /**
     * Returns information about eZ Publish Platform itself.
     *
     * @return array
     */
    public function getEzPlatformInfo();
}
