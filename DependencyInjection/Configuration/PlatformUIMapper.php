<?php

/**
 * File containing the PlatformUIMapper class.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 *
 * @version //autogentag//
 */
namespace EzSystems\PlatformUIBundle\DependencyInjection\Configuration;

use eZ\Bundle\EzPublishCoreBundle\DependencyInjection\Configuration\SiteAccessAware\ContextualizerInterface;
use eZ\Bundle\EzPublishCoreBundle\DependencyInjection\Configuration\SiteAccessAware\HookableConfigurationMapperInterface;

/**
 * Configuration mapper for PlatformUIBundle.
 */
class PlatformUIMapper implements HookableConfigurationMapperInterface
{
    private $allModules = [];

    public function preMap(array $config, ContextualizerInterface $contextualizer)
    {
        // Nothing to do here.
    }

    public function mapConfig(array &$scopeSettings, $currentScope, ContextualizerInterface $contextualizer)
    {
        $this->mapConfigYui($scopeSettings, $currentScope, $contextualizer);
        $this->mapConfigCss($scopeSettings, $currentScope, $contextualizer);
    }

    protected function mapConfigCss(array &$scopeSettings, $currentScope, ContextualizerInterface $contextualizer)
    {
        if (isset($scopeSettings['css']['files'])) {
            $scopeSettings['css.files'] = $scopeSettings['css']['files'];
        }
    }

    protected function mapConfigYui(array &$scopeSettings, $currentScope, ContextualizerInterface $contextualizer)
    {
        if (isset($scopeSettings['yui']['filter'])) {
            $contextualizer->setContextualParameter('yui.filter', $currentScope, $scopeSettings['yui']['filter']);
        }

        if (isset($scopeSettings['yui']['combine'])) {
            $contextualizer->setContextualParameter('yui.combine', $currentScope, $scopeSettings['yui']['combine']);
        }

        if (isset($scopeSettings['yui']['modules'])) {
            // Adding entries in $scopeSettings, so that they can be merged across scopes further on,
            // as $contextualizer->mapConfigArray() can only merge with 1st level settings in the configuration tree.
            foreach ($scopeSettings['yui']['modules'] as $moduleName => $moduleConfig) {
                $scopeSettings['yui.modules'][] = $moduleName;
                $this->allModules[] = $moduleName;
                if (isset($moduleConfig['path'])) {
                    $contextualizer->setContextualParameter("yui.modules.{$moduleName}.path", $currentScope, $moduleConfig['path']);
                }

                $contextualizer->setContextualParameter("yui.modules.{$moduleName}.type", $currentScope, $moduleConfig['type']);
                if (isset($moduleConfig['requires'])) {
                    if (!isset($scopeSettings["yui.modules.{$moduleName}.requires"])) {
                        $scopeSettings["yui.modules.{$moduleName}.requires"] = [];
                    }

                    $scopeSettings["yui.modules.{$moduleName}.requires"] = array_merge(
                        $scopeSettings["yui.modules.{$moduleName}.requires"],
                        $moduleConfig['requires']
                    );
                }

                if (isset($moduleConfig['dependencyOf'])) {
                    if (!isset($scopeSettings["yui.modules.{$moduleName}.dependencyOf"])) {
                        $scopeSettings["yui.modules.{$moduleName}.dependencyOf"] = [];
                    }

                    $scopeSettings["yui.modules.{$moduleName}.dependencyOf"] = array_merge(
                        $scopeSettings["yui.modules.{$moduleName}.dependencyOf"],
                        $moduleConfig['dependencyOf']
                    );
                }
            }
        }
    }

    public function postMap(array $config, ContextualizerInterface $contextualizer)
    {
        $contextualizer->mapConfigArray('yui.modules', $config, ContextualizerInterface::UNIQUE);
        foreach (array_unique($this->allModules) as $moduleName) {
            $contextualizer->mapConfigArray("yui.modules.{$moduleName}.requires", $config, ContextualizerInterface::UNIQUE);
            $contextualizer->mapConfigArray("yui.modules.{$moduleName}.dependencyOf", $config, ContextualizerInterface::UNIQUE);
        }

        $contextualizer->mapConfigArray('css.files', $config, ContextualizerInterface::UNIQUE);
    }
}
