<?php
/**
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle\ApplicationConfig\Providers;

use EzSystems\PlatformUIBundle\ApplicationConfig\Provider;

/**
 * Provides the Locales conversion map from POSIX code to eZ Locale Code.
 */
class LocalesMap implements Provider
{
    /** @var string */
    private $eZToPosixMap;

    public function __construct($localesMap)
    {
        $this->eZToPosixMap = $localesMap;
    }

    public function getConfig()
    {
        return array_flip($this->eZToPosixMap);
    }
}
