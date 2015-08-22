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
    public function testCategoryNameSameAsConstant()
    {
        $aggregator = new Aggregator();

        self::assertEquals($aggregator->getCategoryName(), Aggregator::CATEGORY_NAME);
    }

    public function testEmptyAggregatorGetConfig()
    {
        $aggregator = new Aggregator();

        self::assertEquals(
            [
                $aggregator->getCategoryName() => [],
            ],
            $aggregator->getConfig()
        );
    }

    public function testProvidersGetConfig()
    {
        $aggregator = new Aggregator();

        $aggregator->addProviders(
            [
                'a' => $this->createProvider(),
                'b' => $this->createProvider(),
            ]
        );
    }

    public function testAddBundleProviders()
    {
        $aggregator = new Aggregator();

        $aggregator->addBundleProviders(
            [
                'a' => $this->createProvider(),
                'b' => $this->createProvider(),
            ]
        );
    }

    public function testProviderOnlyGetConfig()
    {
        $aggregator = new Aggregator();

        $aggregator->addProviders(
            [
                'a' => $this->createProvider(),
                'b' => $this->createProvider(),
            ]
        );

        self::assertEquals(
            [
                'a' => [],
                'b' => [],
                Aggregator::CATEGORY_NAME => [],
            ],
            $aggregator->getConfig()
        );
    }

    public function testBundleProviderOnlyGetConfig()
    {
        $aggregator = new Aggregator();

        $aggregator->addBundleProviders(
            [
                'a' => $this->createProvider(),
                'b' => $this->createProvider(),
            ]
        );

        self::assertEquals(
            [
                $aggregator->getCategoryName() => [
                    'test_category' => [
                        'a' => [],
                        'b' => [],
                    ],
                ],
            ],
            $aggregator->getConfig()
        );
    }

    public function testAllProvidersGetConfig()
    {
        $aggregator = new Aggregator();

        $aggregator->addProviders(
            [
                'a' => $this->createProvider(),
                'b' => $this->createProvider(),
            ]
        );

        $aggregator->addBundleProviders(
            [
                'c' => $this->createProvider(),
                'd' => $this->createProvider(),
            ]
        );

        self::assertEquals(
            [
                'a' => [],
                'b' => [],
                $aggregator->getCategoryName() => [
                    'test_category' => [
                        'c' => [],
                        'd' => [],
                    ],
                ],
            ],
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

        $mock
            ->expects($this->any())
            ->method('getCategoryName')
            ->will($this->returnValue('test_category'));

        return $mock;
    }
}
