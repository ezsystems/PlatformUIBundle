<?php
/**
 * File containing the SystemInfoHelperInterface interface.
 *
 * @copyright Copyright (C) 1999-2014 eZ Systems AS. All rights reserved.
 * @license http://www.gnu.org/licenses/gpl-2.0.txt GNU General Public License v2
 * @version //autogentag//
 */

namespace EzSystems\PlatformUIBundle\Helper;

interface SystemInfoHelperInterface
{
    /**
     * Returns information about the system running eZ Publish Platform
     *
     * @return array
     */
    public function getSystemInfo();

    /**
     * Returns information about eZ Publish Platform itself
     *
     * @return array
     */
    public function getEzPlatformInfo();
}
