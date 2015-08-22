<?php
/**
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle\DependencyInjection\Compiler;

use InvalidArgumentException;
use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Reference;
use EzSystems\PlatformUIBundle\ApplicationConfig\Aggregator;

class ApplicationConfigProviderPass implements CompilerPassInterface
{
    private $reservedTags = [
        Aggregator::CATEGORY_NAME,
    ];

    public function process(ContainerBuilder $container)
    {
        if (!$container->hasDefinition('ezsystems.platformui.application_config.aggregator')) {
            return;
        }

        $providers = [];
        $taggedServiceIds = $container->findTaggedServiceIds('ezsystems.platformui.application_config_provider');
        foreach ($taggedServiceIds as $taggedServiceId => $tags) {
            foreach ($tags as $tag) {
                if (!isset($tag['key'])) {
                    throw new InvalidArgumentException(
                        "The service tag 'ezsystems.platformui.application_config_provider' requires a 'key' attribute"
                    );
                }
                if (in_array($tag['key'], $this->reservedTags)) {
                    throw new InvalidArgumentException(
                        'The service tag cannot be one of reserved words (' . implode(', ', $this->reservedTags) . ')'
                    );
                }
                $providers[$tag['key']] = new Reference($taggedServiceId);
            }
        }

        $bundleProviders = $this->processBundles($container);

        $aggregatorDefinition = $container->getDefinition('ezsystems.platformui.application_config.aggregator');
        $aggregatorDefinition->addMethodCall('addProviders', [$providers]);
        $aggregatorDefinition->addMethodCall('addBundleProviders', [$bundleProviders]);
    }

    public function processBundles(ContainerBuilder $container)
    {
        $providers = [];
        $taggedServiceIds = $container->findTaggedServiceIds('ezsystems.bundle_application_config_provider');
        foreach ($taggedServiceIds as $taggedServiceId => $tags) {
            foreach ($tags as $tag) {
                if (!isset($tag['key'])) {
                    throw new InvalidArgumentException(
                        'The service [' . $taggedServiceId . "] tag 'ezsystems.bundle_application_config_provider' requires a 'key' attribute"
                    );
                }
                $providers[$tag['key']] = new Reference($taggedServiceId);
            }
        }

        return $providers;
    }
}
