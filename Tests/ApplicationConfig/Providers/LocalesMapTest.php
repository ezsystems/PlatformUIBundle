<?php
/**
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle\Tests\ApplicationConfig\Providers;

use EzSystems\PlatformUIBundle\ApplicationConfig\Providers\LocalesMap;
use PHPUnit_Framework_TestCase;

class LocalesMapTest extends PHPUnit_Framework_TestCase
{
    public function testGetConfig()
    {
        $provider = new LocalesMap(['eng-GB' => 'en_EN', 'fre-FR' => 'fr_FR']);
        self::assertEquals(
            ['en_EN' => 'eng-GB', 'fr_FR' => 'fre-FR'],
            $provider->getConfig()
        );
    }
}
