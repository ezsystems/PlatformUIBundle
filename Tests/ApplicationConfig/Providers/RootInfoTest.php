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
    const ASSETS_DIR = 'path/to/assets';

    public function testGetConfig()
    {
        $provider = new RootInfo($this->createRequestStack(), $this->getAssetsHelperMock(), self::ASSETS_DIR);
        self::assertEquals(
            ['root' => '', 'assetRoot' => '/', 'ckeditorPluginPath' => '/' . self::ASSETS_DIR . '/vendors/'],
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
        $assetsHelper->expects($this->any())->method('getUrl')->willReturnMap([
            ['/', null, null, '/'],
            [self::ASSETS_DIR, null, null, '/' . self::ASSETS_DIR],
        ]);

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
