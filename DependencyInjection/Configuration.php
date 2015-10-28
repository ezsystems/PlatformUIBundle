<?php

/**
 * File containing the Configuration class.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle\DependencyInjection;

use Symfony\Component\Config\Definition\Builder\TreeBuilder;
use Symfony\Component\Config\Definition\Builder\NodeBuilder;
use eZ\Bundle\EzPublishCoreBundle\DependencyInjection\Configuration\SiteAccessAware\Configuration as SiteAccessConfiguration;

class Configuration extends SiteAccessConfiguration
{
    /**
     * Defines the expected configuration for the CSS.
     *
     * @param $saNode \Symfony\Component\Config\Definition\Builder\NodeBuilder
     */
    protected function defineCss(NodeBuilder $saNode)
    {
        $saNode
            ->arrayNode('css')
                ->children()
                    ->arrayNode('files')
                        ->prototype('scalar')->end()
                    ->end()
                ->end()
            ->end();
    }

    /**
     * Defines the expected configuration for the YUI modules.
     *
     * @param $saNode \Symfony\Component\Config\Definition\Builder\NodeBuilder
     */
    protected function defineYui(NodeBuilder $saNode)
    {
        $saNode
            ->arrayNode('yui')
                ->children()
                    ->enumNode('filter')
                        ->values(['raw', 'min', 'debug'])
                        ->info("Filter to apply to module urls. This filter will modify the default path for all modules.\nPossible values are 'raw', 'min' or 'debug''")
                    ->end()
                    ->booleanNode('combine')
                        ->info('If true, YUI combo loader will be used.')
                    ->end()
                    ->arrayNode('modules')
                        ->useAttributeAsKey('yui_module_name')
                        ->normalizeKeys(false)
                        ->prototype('array')
                            ->info('YUI module definitions')
                            ->children()
                                ->scalarNode('path')
                                    ->info("Path to the module's JS file, relative to web/ directory.")
                                    ->example('bundles/acmedemo/js/my_yui_module.js')
                                ->end()
                                ->arrayNode('requires')
                                    ->info("Module's dependencies. Use modules' name to reference them.")
                                    ->example(['ez-capi', 'parallel'])
                                    ->prototype('scalar')->end()
                                ->end()
                                ->arrayNode('dependencyOf')
                                    ->info("Reverse dependencies.\nWhen loading modules referenced here, current module will be considered as a dependency.")
                                    ->example(['ez-capi', 'parallel'])
                                    ->prototype('scalar')->end()
                                ->end()
                                ->enumNode('type')
                                    ->values(['js', 'template'])
                                    ->defaultValue('js')
                                    ->info("Type of module, either 'js' or 'template'")
                                ->end()
                            ->end()
                        ->end()
                    ->end()
                ->end()
            ->end();
    }

    public function getConfigTreeBuilder()
    {
        $treeBuilder = new TreeBuilder();
        $rootNode = $treeBuilder->root('ez_platformui');

        $saNode = $this->generateScopeBaseNode($rootNode);

        $this->defineYui($saNode);
        $this->defineCss($saNode);

        return $treeBuilder;
    }
}
