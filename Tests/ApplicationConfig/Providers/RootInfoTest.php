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
    const URI = '/ez';

    public function testGetConfig()
    {
        $provider = new RootInfo($this->createRequestStack(), $this->getAssetsHelperMock(), self::ASSETS_DIR);
        self::assertEquals(
            ['root' => self::URI, 'assetRoot' => '/', 'ckeditorPluginPath' => '/' . self::ASSETS_DIR . '/vendors/', 'apiRoot' => '/'],
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
        $attrs = ['semanticPathinfo' => self::URI];
        $server = ['SCRIPT_URL' => self::URI];
        $request = new Request([], [], $attrs, [], [], $server);
        $requestStack->push($request);

        return $requestStack;
    }
}
