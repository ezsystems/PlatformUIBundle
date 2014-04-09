<?php
/**
 * File containing the TwigYuiExtensionTest class.
 *
 * @copyright Copyright (C) 1999-2013 eZ Systems AS. All rights reserved.
 * @license http://www.gnu.org/licenses/gpl-2.0.txt GNU General Public License v2
 * @version //autogentag//
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
        return array(
            new TwigYuiExtension(
                array(
                    'modules' => array()
                )
            )
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
        $extension = new TwigYuiExtension( $module );
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
                        return self::PREFIX . $path;
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
                            'path' => 'js/test.js'
                        ),
                        'ez-test2' => array(
                            'path' => 'js/test2.js'
                        )
                    ),
                    'filter' => 'min'
                ),
                '{"modules":{"ez-test":{"fullpath":"' . self::PREFIX . 'bundles/ezplatformui/js/test.js"},"ez-test2":{"fullpath":"' . self::PREFIX . 'bundles/ezplatformui/js/test2.js"}},"filter":"min"};'
            )
        );
    }
}
