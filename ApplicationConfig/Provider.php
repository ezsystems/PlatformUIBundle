<?php
/**
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle\ApplicationConfig;

/**
 * Provides parameters as a serializable value.
 */
interface Provider
{
    /**
     * @return string Return category name this provider belongs to
     */
    public function getCategoryName();

    /**
     * @return mixed Anything that is serializable via json_encode()
     */
    public function getConfig();
}
