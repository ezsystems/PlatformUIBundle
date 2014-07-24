<?php
/**
 * File containing the Configuration class.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */

namespace EzSystems\PlatformUIBundle\DependencyInjection;

use Symfony\Component\Config\Definition\Builder\TreeBuilder;
use eZ\Bundle\EzPublishCoreBundle\DependencyInjection\Configuration\SiteAccessAware\Configuration as SiteAccessConfiguration;

class Configuration extends SiteAccessConfiguration
{
    public function getConfigTreeBuilder()
    {
        $treeBuilder = new TreeBuilder();
        $rootNode = $treeBuilder->root( 'ez_platformui' );

        $saNode = $this->generateScopeBaseNode( $rootNode );
        $saNode
            ->arrayNode( 'yui' )
                ->children()
                    ->enumNode( 'filter' )
                        ->values( array( 'raw', 'min', 'debug' ) )
                        ->info( "Filter to apply to module urls. This filter will modify the default path for all modules.\nPossible values are 'raw', 'min' or 'debug''" )
                    ->end()
                    ->arrayNode( 'modules' )
                        ->useAttributeAsKey( 'yui_module_name' )
                        ->normalizeKeys( false )
                        ->prototype( 'array' )
                            ->info( 'YUI module definitions' )
                            ->children()
                                ->scalarNode( 'path' )
                                    ->isRequired()
                                    ->info( "Path to the module's JS file, relative to web/ directory." )
                                    ->example( 'bundles/acmedemo/js/my_yui_module.js' )
                                ->end()
                                ->arrayNode( 'requires' )
                                    ->info( "Module's dependencies. Use modules' name to reference them." )
                                    ->example( array( 'ez-capi', 'parallel' ) )
                                    ->prototype( 'scalar' )->end()
                                ->end()
                                ->arrayNode( 'dependencyOf' )
                                    ->info( "Reverse dependencies.\nWhen loading modules referenced here, current module will be considered as a dependency." )
                                    ->example( array( 'ez-capi', 'parallel' ) )
                                    ->prototype( 'scalar' )->end()
                                ->end()
                            ->end()
                        ->end()
                    ->end()
                ->end()
            ->end();

        return $treeBuilder;
    }
}
