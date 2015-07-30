<?php
/**
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle\Tests\ApplicationConfig\Providers;

use EzSystems\PlatformUIBundle\ApplicationConfig\Providers\Value;
use PHPUnit_Framework_TestCase;

class ValueTest extends PHPUnit_Framework_TestCase
{
    public function testGetConfig()
    {
        $countries = ['Shire', 'Iceland', 'Wonderland', 'Fourecks'];
        $provider = new Value($countries);
        self::assertEquals(
            $countries,
            $provider->getConfig()
        );
    }
}
