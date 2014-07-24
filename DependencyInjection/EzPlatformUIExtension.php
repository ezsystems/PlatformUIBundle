<?php
/**
 * File containing the eZPlatformUIExtension class.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */

namespace EzSystems\PlatformUIBundle\DependencyInjection;

use Symfony\Component\DependencyInjection\Container;
use EzSystems\PlatformUIBundle\EzSystemsPlatformUIBundle;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\Config\FileLocator;
use Symfony\Component\DependencyInjection\Exception\BadMethodCallException;
use Symfony\Component\DependencyInjection\Extension\PrependExtensionInterface;
use Symfony\Component\HttpKernel\DependencyInjection\Extension;
use Symfony\Component\DependencyInjection\Loader;

class EzPlatformUIExtension extends Extension implements PrependExtensionInterface
{
    public function getAlias()
    {
        return 'ez_platformui';
    }

    /**
     * {@inheritDoc}
     */
    public function load(array $configs, ContainerBuilder $container)
    {
        $configuration = new Configuration();
        $config = $this->processConfiguration( $configuration, $configs );

        $loader = new Loader\YamlFileLoader( $container, new FileLocator( __DIR__ . '/../Resources/config' ) );
        $loader->load( 'services.yml' );
        $loader->load( 'yui.yml' );

    public function prepend( ContainerBuilder $container )
    {
        $container->prependExtensionConfig( 'assetic', array( 'bundles' => array( EzSystemsPlatformUIBundle::NAME ) ) );
    }
}
