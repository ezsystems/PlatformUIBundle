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
    const PREFIX = 'ezplatformui';

    protected function getExtensions()
    {
        $configResolver = $this->getMock('eZ\Publish\Core\MVC\ConfigResolverInterface');
        $configResolver
            ->expects($this->any())
            ->method('getParameter')
            ->will(
                $this->returnValueMap(
                    [
                        ['yui.modules', 'ez_platformui', null, []],
                        ['yui.filter', 'ez_platformui', null, 'min'],
                    ]
                )
            );

        $router = $this->getMock('\Symfony\Component\Routing\RouterInterface');

        return [new TwigYuiExtension($configResolver, $router)];
    }

    protected function getFixturesDir()
    {
        return __DIR__ . '/Fixtures/';
    }

    /**
     * @params array $module, string $expectedResult
     *
     * @dataProvider dataProviderConfig
     */
    public function testConfig(array $modules, $filter, $expectedResult)
    {
        $configResolverMock = $this->getMock('eZ\Publish\Core\MVC\ConfigResolverInterface');
        $modulesList = array_keys($modules);
        $getParameterValueMap = [
            ['yui.modules', 'ez_platformui', null, $modulesList],
            ['yui.filter', 'ez_platformui', null, $filter],
        ];
        $hasParameterValueMap = [];

        foreach ($modules as $name => $config) {
            if (isset($config['requires'])) {
                $getParameterValueMap[] = ["yui.modules.$name.requires", 'ez_platformui', null, $config['requires']];
                $hasParameterValueMap[] = ["yui.modules.$name.requires", 'ez_platformui', null, true];
            }

            if (isset($config['dependencyOf'])) {
                $getParameterValueMap[] = [
                    "yui.modules.$name.dependencyOf",
                    'ez_platformui',
                    null,
                    $config['dependencyOf'],
                ];
                $hasParameterValueMap[] = ["yui.modules.$name.dependencyOf", 'ez_platformui', null, true];
            }
            if (isset($config['type'])) {
                $getParameterValueMap[] = ["yui.modules.$name.type", 'ez_platformui', null, $config['type']];
            }

            $getParameterValueMap[] = ["yui.modules.$name.path", 'ez_platformui', null, $config['path']];
        }

        $configResolverMock
            ->expects($this->any())
            ->method('hasParameter')
            ->will($this->returnValueMap($hasParameterValueMap));
        $configResolverMock
            ->expects($this->atLeastOnce())
            ->method('getParameter')
            ->will($this->returnValueMap($getParameterValueMap));

        $router = $this->getMock('\Symfony\Component\Routing\RouterInterface');
        $router
            ->expects($this->any())
            ->method('generate')
            ->with(
                $this->equalTo('template_yui_module'),
                $this->callback(
                    function ($params) {
                        return is_array($params) && isset($params['module']);
                    }
                )
            )
            ->will(
                $this->returnCallback(
                    function ($name, $params) {
                        return $name . '/' . $params['module'];
                    }
                )
            );

        $extension = new TwigYuiExtension($configResolverMock, $router);
        $extension->initRuntime($this->getEnvironmentMock());
        $result = $extension->yuiConfigLoaderFunction();
        $this->assertSame($expectedResult, $result);
    }

    /**
     * @return Twig_Environment|\PHPUnit_Framework_MockObject_MockObject
     */
    protected function getEnvironmentMock()
    {
        $envMock = $this->getMock('Twig_Environment');
        $functionMock = $this->getMock('Twig_Function');
        $envMock->expects($this->any())->method('getFunction')->will($this->returnValue($functionMock));
        $functionMock
            ->expects($this->any())
            ->method('getCallable')
            ->will(
                $this->returnValue(
                    function ($path) {
                        return self::PREFIX . '/' . $path;
                    }
                )
            );

        return $envMock;
    }

    public function dataProviderConfig()
    {
        return [
            [
                [],
                'min',
                '{"filter":"min","modules":[]};',
            ],
            [
                [
                    'ez-test' => [
                        'path' => 'bundles/ezplatformui/js/test.js',
                    ],
                    'ez-test2' => [
                        'path' => 'bundles/ezplatformui/js/test2.js',
                    ],
                    'ez-template' => [
                        'path' => 'bundles/ezplatformui/template/template.js',
                        'type' => 'template',
                    ],
                ],
                'debug',
                '{"filter":"debug","modules":{' .
                '"ez-test":{"requires":[],"fullpath":"' . self::PREFIX . '/bundles/ezplatformui/js/test.js"},' .
                '"ez-test2":{"requires":[],"fullpath":"' . self::PREFIX . '/bundles/ezplatformui/js/test2.js"},' .
                '"ez-template":{"requires":["template","handlebars"],"fullpath":"template_yui_module/ez-template"}' .
                '}};',
            ],
            [
                [
                    'ez-test' => [
                        'path' => 'bundles/ezplatformui/js/test.js',
                        'requires' => ['foo', 'bar'],
                    ],
                    'ez-test2' => [
                        'path' => 'bundles/ezplatformui/js/test2.js',
                        'requires' => ['ez-test'],
                    ],
                ],
                'raw',
                '{"filter":"raw","modules":{' .
                '"ez-test":{"requires":["foo","bar"],"fullpath":"' . self::PREFIX . '/bundles/ezplatformui/js/test.js"},' .
                '"ez-test2":{"requires":["ez-test"],"fullpath":"' . self::PREFIX . '/bundles/ezplatformui/js/test2.js"}' .
                '}};',
            ],
            [
                [
                    'ez-test' => [
                        'path' => 'bundles/ezplatformui/js/test.js',
                        'requires' => ['foo', 'bar'],
                    ],
                    'ez-test2' => [
                        'path' => 'bundles/ezplatformui/js/test2.js',
                        'requires' => ['baz'],
                        'dependencyOf' => ['ez-test'],
                    ],
                ],
                'raw',
                '{"filter":"raw","modules":{' .
                '"ez-test":{"requires":["foo","bar","ez-test2"],"fullpath":"' . self::PREFIX . '/bundles/ezplatformui/js/test.js"},' .
                '"ez-test2":{"requires":["baz"],"fullpath":"' . self::PREFIX . '/bundles/ezplatformui/js/test2.js"}' .
                '}};',
            ],
            [
                [
                    'ez-test' => [
                        'path' => 'bundles/ezplatformui/js/test.js',
                    ],
                    'ez-test2' => [
                        'path' => 'bundles/ezplatformui/js/test2.js',
                        'requires' => ['baz'],
                        'dependencyOf' => ['ez-test', 'another-module'],
                    ],
                    'another-module' => [
                        'path' => 'js/fork_me_im_famous.js',
                        'requires' => ['michaeljackson', 'is', 'from', 'venus'],
                        'dependencyOf' => ['ez-test'],
                    ],
                ],
                'min',
                '{"filter":"min","modules":{' .
                '"ez-test":{"requires":["ez-test2","another-module"],"fullpath":"' . self::PREFIX . '/bundles/ezplatformui/js/test.js"},' .
                '"ez-test2":{"requires":["baz"],"fullpath":"' . self::PREFIX . '/bundles/ezplatformui/js/test2.js"},' .
                '"another-module":{"requires":["ez-test2","michaeljackson","is","from","venus"],"fullpath":"' . self::PREFIX . '/js/fork_me_im_famous.js"}' .
                '}};',
            ],
            [
                [
                    'ez-test' => [
                        'path' => 'bundles/ezplatformui/js/test.js',
                    ],
                    'ez-test2' => [
                        'path' => 'bundles/ezplatformui/js/test2.js',
                        'requires' => ['baz'],
                        'dependencyOf' => ['ez-test', 'another-module'],
                    ],
                ],
                'min',
                '{"filter":"min","modules":{' .
                '"ez-test":{"requires":["ez-test2"],"fullpath":"' . self::PREFIX . '/bundles/ezplatformui/js/test.js"},' .
                '"ez-test2":{"requires":["baz"],"fullpath":"' . self::PREFIX . '/bundles/ezplatformui/js/test2.js"}' .
                '}};',
            ],
        ];
    }
}
