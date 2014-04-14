<?php
/**
 * File containing the SystemInfoHelper class.
 *
 * @copyright Copyright (C) 1999-2014 eZ Systems AS. All rights reserved.
 * @license http://www.gnu.org/licenses/gpl-2.0.txt GNU General Public License v2
 * @version //autogentag//
 */

namespace EzSystems\PlatformUIBundle\Helper;

use Symfony\Component\HttpKernel\Kernel;

use ezcSystemInfo;
use eZExtension;
use eZPublishSDK;

class SystemInfoHelper
{
    /**
     * @var \eZ\Publish\Core\MVC\Legacy\Kernel
     */
    private $legacyKernel;

    /**
     * An array containing the active bundles (keys) and the corresponding 
     * namespace.
     *
     * @var array
     */
    private $bundles;

    public function __construct( \Closure $legacyKernelClosure, array $bundles )
    {
        $this->legacyKernel = $legacyKernelClosure();
        $this->bundles = $bundles;
    }

    /**
     * Returns the system information:
     *  - cpu information
     *  - memory size
     *  - php version
     *  - php accelerator info
     *
     * @return array
     */
    public function getSystemInfo()
    {
        $info = ezcSystemInfo::getInstance();
        $accelerator = false;
        if ( $info->phpAccelerator )
        {
            $accelerator = array(
                'name' => $info->phpAccelerator->name,
                'url' => $info->phpAccelerator->url,
                'enabled' => $info->phpAccelerator->isEnabled,
                'versionString' => $info->phpAccelerator->versionString
            );
        }
        return array(
            'cpuType' => $info->cpuType,
            'cpuSpeed' => $info->cpuSpeed,
            'cpuCount' => $info->cpuCount,
            'memorySize' => $info->memorySize,
            'phpVersion' => phpversion(),
            'phpAccelerator' => $accelerator,
        );
    }

    /**
     * Returns informations on the current eZ Platform install:
     *  - eZ Publish legacy version
     *  - eZ Publish legacy extensions
     *  - Symfony bundles
     *
     * @return array
     */
    public function getEzPlatformInfo()
    {
        $info = $this->legacyKernel->runCallback(
            function ()
            {
                return array(
                    'version' => eZPublishSDK::version(),
                    'extensions' => eZExtension::activeExtensions(),
                );
            }
        );
        $info['symfony'] = Kernel::VERSION;
        sort( $info['extensions'] );
        $info['bundles'] = $this->bundles;
        ksort( $info['bundles'], SORT_FLAG_CASE | SORT_STRING );
        return $info;
    }
}
