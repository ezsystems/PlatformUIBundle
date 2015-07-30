<?php
/**
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle\Tests\ApplicationConfig\Providers;

use EzSystems\PlatformUIBundle\ApplicationConfig\Providers\AnonymousUserId;
use PHPUnit_Framework_TestCase;

class AnonymousUserIdTest extends PHPUnit_Framework_TestCase
{
    public function testGetConfig()
    {
        $provider = new AnonymousUserId($this->getRouterMock(), 42);
        self::assertEquals(
            '/api/ezp/v2/user/users/42',
            $provider->getConfig()
        );
    }

    private function getRouterMock()
    {
        $mock = $this->getMock('\Symfony\Component\Routing\RouterInterface');
        $mock
            ->expects($this->once())
            ->method('generate')
            ->with($this->isType('string'), ['userId' => 42])
            ->will($this->returnValue('/api/ezp/v2/user/users/42'));

        return $mock;
    }
}
