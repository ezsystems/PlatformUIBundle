<?php

/**
 * File containing the TwigYuiExtension class.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle\Twig;

use eZ\Publish\Core\MVC\ConfigResolverInterface;
use Symfony\Component\Routing\RouterInterface;
use Psr\Log\LoggerInterface;
use Twig_Environment;
use Twig_Extension;
use Twig_SimpleFunction;

/**
 * Class TwigYuiExtension.
 */
class TwigYuiExtension extends Twig_Extension
{
    /**
     * @var Twig_Environment
     */
    protected $twig;

    /**
     * @var \eZ\Publish\Core\MVC\ConfigResolverInterface
     */
    private $configResolver;

    /**
     * @var \Psr\Log\LoggerInterface
     */
    private $logger;

    /**
     * @var \Symfony\Component\Routing\RouterInterface
     */
    private $router;

    public function __construct(ConfigResolverInterface $configResolver, RouterInterface $router, LoggerInterface $logger = null)
    {
        $this->configResolver = $configResolver;
        $this->router = $router;
        $this->logger = $logger;
    }

    public function getFunctions()
    {
        return [
            new Twig_SimpleFunction(
                'ez_platformui_yui_config',
                [$this, 'yuiConfigLoaderFunction'],
                ['is_safe' => ['html']]
            ),
        ];
    }

    public function initRuntime(Twig_Environment $twig)
    {
        $this->twig = $twig;
    }

    /**
     * Calls the twig asset function.
     *
     * @param string $asset
     *
     * @return mixed
     */
    protected function asset($asset)
    {
        return call_user_func($this->twig->getFunction('asset')->getCallable(), $asset);
    }

    /**
     * Returns the YUI loader configuration.
     *
     * @param string $configObject
     *
     * @return string
     */
    public function yuiConfigLoaderFunction($configObject = '')
    {
        $modules = array_fill_keys($this->configResolver->getParameter('yui.modules', 'ez_platformui'), true);
        $yui = [
            'filter' => $this->configResolver->getParameter('yui.filter', 'ez_platformui'),
            'modules' => [],
        ];

        $combine = $this->configResolver->getParameter('yui.combine', 'ez_platformui');

        if ($combine === true) {
            $yui['combine'] = true;
            $yui['root'] = '';
            $yui['comboBase'] = $this->router->generate('yui_combo_loader') . '?';
        }

        foreach (array_keys($modules) as $module) {
            if (!isset($yui['modules'][$module]['requires'])) {
                $yui['modules'][$module]['requires'] = [];
            }

            // Module dependencies
            if ($this->configResolver->hasParameter("yui.modules.$module.requires", 'ez_platformui')) {
                $yui['modules'][$module]['requires'] = array_merge(
                    $yui['modules'][$module]['requires'],
                    $this->configResolver->getParameter("yui.modules.$module.requires", 'ez_platformui')
                );
            }

            // Reverse dependencies
            if ($this->configResolver->hasParameter("yui.modules.$module.dependencyOf", 'ez_platformui')) {
                foreach ($this->configResolver->getParameter("yui.modules.$module.dependencyOf", 'ez_platformui') as $dep) {
                    // Add reverse dependency only if referred module is declared in the modules list.
                    if (!isset($modules[$dep])) {
                        if ($this->logger) {
                            $this->logger->error("'$module' is declared to be a dependency of undeclared module '$dep'. Ignoring.");
                        }
                        continue;
                    }

                    $yui['modules'][$dep]['requires'][] = $module;
                }
            }

            if ($combine === true) {
                $yui['modules'][$module]['combine'] = true;
            }

            if ($this->configResolver->getParameter("yui.modules.$module.type", 'ez_platformui') === 'template') {
                $yui['modules'][$module]['requires'][] = 'template';
                $yui['modules'][$module]['requires'][] = 'handlebars';
                $yui['modules'][$module]['fullpath'] = $this->router->generate(
                    'template_yui_module',
                    ['module' => $module]
                );
            } else {
                $yui['modules'][$module]['fullpath'] = $this->asset(
                    $this->configResolver->getParameter("yui.modules.$module.path", 'ez_platformui')
                );
            }
        }

        // Now ensure that all requirements are unique
        foreach ($yui['modules'] as &$moduleConfig) {
            $moduleConfig['requires'] = array_unique($moduleConfig['requires']);
        }

        $res = '';
        if ($configObject != '') {
            $res = $configObject . ' = ';
        }

        return $res . (defined('JSON_UNESCAPED_SLASHES') ? json_encode($yui, JSON_UNESCAPED_SLASHES) :  json_encode($yui)) . ';';
    }

    /**
     * Returns the name of the extension.
     *
     * @return string The extension name
     */
    public function getName()
    {
        return 'twig_yui_config_extension';
    }
}
