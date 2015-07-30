<?php

/**
 * File containing the eZPlatformUIExtension class.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle\DependencyInjection;

use eZ\Bundle\EzPublishCoreBundle\DependencyInjection\Configuration\SiteAccessAware\ConfigurationProcessor;
use EzSystems\PlatformUIBundle\DependencyInjection\Configuration\PlatformUIMapper;
use Symfony\Component\Config\Resource\FileResource;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\Config\FileLocator;
use Symfony\Component\DependencyInjection\Extension\PrependExtensionInterface;
use Symfony\Component\HttpKernel\DependencyInjection\Extension;
use Symfony\Component\DependencyInjection\Loader;
use Symfony\Component\Yaml\Yaml;

class EzPlatformUIExtension extends Extension implements PrependExtensionInterface
{
    public function getAlias()
    {
        return 'ez_platformui';
    }

    public function load(array $configs, ContainerBuilder $container)
    {
        $configuration = new Configuration();
        $config = $this->processConfiguration($configuration, $configs);

        $loader = new Loader\YamlFileLoader($container, new FileLocator(__DIR__ . '/../Resources/config'));
        $loader->load('services.yml');
        $loader->load('default_settings.yml');

        $processor = new ConfigurationProcessor($container, 'ez_platformui');
        $processor->mapConfig($config, new PlatformUIMapper());
    }

    public function prepend(ContainerBuilder $container)
    {
        $container->prependExtensionConfig('assetic', ['bundles' => ['eZPlatformUIBundle']]);

        $this->prependYui($container);
        $this->prependCss($container);
        $this->prependImageVariations($container);
    }

    private function prependYui(ContainerBuilder $container)
    {
        # Directories where public resources are stored (relative to web/ directory).
        $container->setParameter('ez_platformui.public_dir', 'bundles/ezplatformui');
        $container->setParameter('ez_platformui.external_assets_public_dir', 'bundles/ezplatformuiassets');
        $yuiConfigFile = __DIR__ . '/../Resources/config/yui.yml';
        $config = Yaml::parse(file_get_contents($yuiConfigFile));
        $container->prependExtensionConfig('ez_platformui', $config);
        $container->addResource(new FileResource($yuiConfigFile));
    }

    private function prependCss(ContainerBuilder $container)
    {
        $cssConfigFile = __DIR__ . '/../Resources/config/css.yml';
        $config = Yaml::parse(file_get_contents($cssConfigFile));
        $container->prependExtensionConfig('ez_platformui', $config);
        $container->addResource(new FileResource($cssConfigFile));
    }

    private function prependImageVariations(ContainerBuilder $container)
    {
        $imageConfigFile = __DIR__ . '/../Resources/config/image_variations.yml';
        $config = Yaml::parse(file_get_contents($imageConfigFile));
        $container->prependExtensionConfig('ezpublish', $config);
        $container->addResource(new FileResource($imageConfigFile));
    }
}
