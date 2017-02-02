<?php
/**
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle\Tests\ApplicationConfig\Providers;

use EzSystems\PlatformUIBundle\ApplicationConfig\Providers\RootInfo;
use PHPUnit_Framework_TestCase;
use Symfony\Component\Asset\Packages;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;

class RootInfoTest extends PHPUnit_Framework_TestCase
{
    const ASSETS_DIR = 'path/to/assets';
    const URI = '/ez';

    public function testGetConfig()
    {
        $provider = new RootInfo($this->createRequestStack(), $this->getAssetsPackagesMock(), self::ASSETS_DIR);
        self::assertEquals(
            ['root' => self::URI, 'assetRoot' => '/', 'ckeditorPluginPath' => '/' . self::ASSETS_DIR . '/vendors/', 'apiRoot' => '/'],
            $provider->getConfig()
        );
    }

    /**
     * @return \PHPUnit_Framework_MockObject_MockObject
     */
    protected function getAssetsPackagesMock()
    {
        $assetsHelper = $this
            ->getMockBuilder(Packages::class)
            ->disableOriginalConstructor()
            ->getMock();
        $assetsHelper->expects($this->any())->method('getUrl')->willReturnMap([
            ['/', null, '/'],
            [self::ASSETS_DIR, null, '/' . self::ASSETS_DIR],
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
