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

        return [new TwigYuiExtension($configResolver, $this->getRouterMock())];
    }

    protected function getFixturesDir()
    {
        return __DIR__ . '/Fixtures/';
    }

    /**
     * @return \PHPUnit_Framework_MockObject_MockObject
     */
    protected function getRouterMock()
    {
        $routerMock = $this->getMock('\Symfony\Component\Routing\RouterInterface');
        $routerMock
            ->expects($this->any())
            ->method('generate')
            ->with(
                $this->callback(
                    function ($params) {
                        return in_array($params, ['template_yui_module', 'yui_combo_loader']);
                    }
                ),
                $this->callback(
                    function ($params) {
                        return is_array($params);
                    }
                )
            )
            ->will(
                $this->returnCallback(
                    function ($name, $params) {
                        if (isset($params['module'])) {
                            return $name . '/' . $params['module'];
                        }

                        return $name;
                    }
                )
            );

        return $routerMock;
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

        $extension = new TwigYuiExtension($configResolverMock, $this->getRouterMock());

        // we need to call the twig function that way as a callback is in use there to handle the environment injection
        $callable = $extension->getFunctions()[0]->getCallable();
        $result = $callable($this->getEnvironmentMock());
        $this->assertSame($expectedResult, $result);
    }

    /**
     * @return Twig_Environment|\PHPUnit_Framework_MockObject_MockObject
     */
    protected function getEnvironmentMock()
    {
        $envMock = $this->getMockBuilder('Twig_Environment')->disableOriginalConstructor()->getMock();
        $functionMock = $this->getMockBuilder('Twig_Function')->disableOriginalConstructor()->getMock();
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
                '{"filter":"min","modules":[],"root":"","comboBase":"yui_combo_loader?"};',
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
                '},"root":"","comboBase":"yui_combo_loader?"};',
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
                '},"root":"","comboBase":"yui_combo_loader?"};',
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
                '},"root":"","comboBase":"yui_combo_loader?"};',
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
                '},"root":"","comboBase":"yui_combo_loader?"};',
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
                '},"root":"","comboBase":"yui_combo_loader?"};',
            ],
        ];
    }
}
