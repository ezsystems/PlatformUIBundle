<?php
/**
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle\ApplicationConfig\Providers;

use EzSystems\PlatformUIBundle\ApplicationConfig\Provider;

/**
 * Simple value provider that passes on the value it is given in the constructor.
 *
 * Can be used for container config.
 */
class Value implements Provider
{
    /** @var mixed */
    private $value;

    public function __construct(array $value)
    {
        $this->value = $value;
    }

    public function getConfig()
    {
        return $this->value;
    }
}
