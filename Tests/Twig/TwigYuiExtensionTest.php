<?php
/**
 * File containing the TwigYuiExtensionTest class.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */

namespace EzSystems\PlatformUIBundle\Tests\Twig;

use Twig_Test_IntegrationTestCase;
use EzSystems\PlatformUIBundle\Twig\TwigYuiExtension;
use Twig_Environment;

class TwigYuiExtensionTest extends Twig_Test_IntegrationTestCase
{
    const PREFIX = "ezplatformui";

    protected function getExtensions()
    {
        $configResolver = $this->getMock( 'eZ\Publish\Core\MVC\ConfigResolverInterface' );
        $configResolver
            ->expects( $this->any() )
            ->method( 'getParameter' )
            ->with( 'yui', 'ez_platformui' )
            ->will( $this->returnValue( array( 'modules' => array() ) ) );

        return array(
            new TwigYuiExtension( $configResolver )
        );
    }

    protected function getFixturesDir()
    {
        return __DIR__ . '/Fixtures/';
    }

    /**
     * @params array $module, string $expectedResult
     * @dataProvider dataProviderConfig
     */
    public function testConfig( $module, $expectedResult )
    {
        $configResolverMock = $this->getMock( 'eZ\Publish\Core\MVC\ConfigResolverInterface' );
        $configResolverMock
            ->expects( $this->once() )
            ->method( 'getParameter' )
            ->with( 'yui', 'ez_platformui' )
            ->will( $this->returnValue( $module ) );

        $extension = new TwigYuiExtension( $configResolverMock );
        $extension->initRuntime( $this->getEnvironmentMock() );
        $result = $extension->yuiConfigLoaderFunction();
        $this->assertEquals( $expectedResult, $result );
    }

    /**
     * @return Twig_Environment|\PHPUnit_Framework_MockObject_MockObject
     */
    protected function getEnvironmentMock()
    {
        $envMock = $this->getMock( 'Twig_Environment' );
        $functionMock = $this->getMock( 'Twig_Function' );
        $envMock->expects( $this->any() )->method( 'getFunction' )->will( $this->returnValue( $functionMock ) );
        $functionMock
            ->expects( $this->any() )
            ->method( 'getCallable' )
            ->will(
                $this->returnValue(
                    function ( $path )
                    {
                        return self::PREFIX . '/' . $path;
                    }
                )
            );
        return $envMock;
    }

    public function dataProviderConfig()
    {
        return array(
            array(
                array(
                    'modules' => array()
                ),
                '{"modules":[]};'
            ),
            array(
                array(
                    'modules' => array(),
                    'filter' => 'min'
                ),
                '{"modules":[],"filter":"min"};'
            ),
            array(
                array(
                    'modules' => array(
                        'ez-test' => array(
                            'path' => 'bundles/ezplatformui/js/test.js'
                        ),
                        'ez-test2' => array(
                            'path' => 'bundles/ezplatformui/js/test2.js'
                        )
                    ),
                    'filter' => 'min'
                ),
                '{"modules":{"ez-test":{"fullpath":"' . self::PREFIX . '/bundles/ezplatformui/js/test.js"},"ez-test2":{"fullpath":"' . self::PREFIX . '/bundles/ezplatformui/js/test2.js"}},"filter":"min"};'
            )
        );
    }
}
