<?php
/**
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */

namespace EzSystems\PlatformUIBundle\Tests\ApplicationConfig\Providers;

use EzSystems\PlatformUIBundle\ApplicationConfig\Providers\RootInfo;
use PHPUnit_Framework_TestCase;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;

class RootInfoTest extends PHPUnit_Framework_TestCase
{
    public function testGetConfig()
    {
        $provider = new RootInfo($this->createRequestStack(), $this->getAssetsHelperMock());
        self::assertEquals(
            ['root' => '', 'assetRoot' => '/'],
            $provider->getConfig()
        );
    }

    /**
     * @return \PHPUnit_Framework_MockObject_MockObject
     */
    protected function getAssetsHelperMock()
    {
        $assetsHelper = $this
            ->getMockBuilder('Symfony\Bundle\FrameworkBundle\Templating\Helper\AssetsHelper')
            ->disableOriginalConstructor()
            ->getMock();
        $assetsHelper->expects($this->any())->method('getUrl')->willReturn('/');

        return $assetsHelper;
    }

    /**
     * @return \Symfony\Component\HttpFoundation\RequestStack
     */
    protected function createRequestStack()
    {
        $requestStack = new RequestStack();
        $requestStack->push(new Request([], [], ['semanticPathInfo' => '']));

        return $requestStack;
    }
}
