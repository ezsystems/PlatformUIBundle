<?php
/**
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle\Tests\ApplicationConfig;

use EzSystems\PlatformUIBundle\ApplicationConfig\Aggregator;
use PHPUnit_Framework_TestCase;

/**
 * @covers \EzSystems\PlatformUIBundle\ApplicationConfig\Aggregator
 */
class AggregatorTest extends PHPUnit_Framework_TestCase
{
    public function testAddProviders()
    {
        $aggregator = new Aggregator();
        $aggregator->addProviders(['a' => $this->createProvider(), 'b' => $this->createProvider()]);
    }

    public function testGetConfig()
    {
        $aggregator = new Aggregator();
        $aggregator->addProviders(['a' => $this->createProvider(), 'b' => $this->createProvider()]);
        self::assertEquals(
            ['a' => [], 'b' => []],
            $aggregator->getConfig()
        );
    }

    /**
     * @return \EzSystems\PlatformUIBundle\ApplicationConfig\Provider|\PHPUnit_Framework_MockObject_MockObject
     */
    private function createProvider()
    {
        $mock = $this->getMock('\EzSystems\PlatformUIBundle\ApplicationConfig\Provider');
        $mock
            ->expects($this->any())
            ->method('getConfig')
            ->will($this->returnValue([]));

        return $mock;
    }
}
