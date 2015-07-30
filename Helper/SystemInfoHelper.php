<?php

/**
 * File containing the SystemInfoHelper class.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle\Helper;

use Symfony\Component\HttpKernel\Kernel;
use Doctrine\DBAL\Connection;
use ezcSystemInfo;

class SystemInfoHelper implements SystemInfoHelperInterface
{
    /**
     * An array containing the active bundles (keys) and the corresponding
     * namespace.
     *
     * @var array
     */
    private $bundles;

    /**
     * The database connection, only used to retrieve some information on the
     * database itself.
     *
     * @var \Doctrine\DBAL\Connection
     */
    private $connection;

    public function __construct(Connection $db, array $bundles)
    {
        $this->bundles = $bundles;
        $this->connection = $db;
    }

    /**
     * Returns the system information:
     *  - cpu information
     *  - memory size
     *  - php version
     *  - php accelerator info
     *  - database related info.
     *
     * @return array
     */
    public function getSystemInfo()
    {
        $info = ezcSystemInfo::getInstance();
        $accelerator = false;
        if ($info->phpAccelerator) {
            $accelerator = [
                'name' => $info->phpAccelerator->name,
                'url' => $info->phpAccelerator->url,
                'enabled' => $info->phpAccelerator->isEnabled,
                'versionString' => $info->phpAccelerator->versionString,
            ];
        }

        return [
            'cpuType' => $info->cpuType,
            'cpuSpeed' => $info->cpuSpeed,
            'cpuCount' => $info->cpuCount,
            'memorySize' => $info->memorySize,
            'phpVersion' => phpversion(),
            'phpAccelerator' => $accelerator,
            'database' => [
                'type' => $this->connection->getDatabasePlatform()->getName(),
                'name' => $this->connection->getDatabase(),
                'host' => $this->connection->getHost(),
                'username' => $this->connection->getUsername(),
            ],
        ];
    }

    /**
     * Returns informations on the current eZ Platform install:
     *  - eZ Publish legacy version
     *  - eZ Publish legacy extensions
     *  - Symfony bundles.
     *
     * @return array
     */
    public function getEzPlatformInfo()
    {
        $info = [
            'version' => 'dev',
            'symfony' => Kernel::VERSION,
            'bundles' => $this->bundles,
        ];
        ksort($info['bundles'], SORT_FLAG_CASE | SORT_STRING);

        return $info;
    }
}
