<?php
/**
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle\DependencyInjection\Compiler;

use InvalidArgumentException;
use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Reference;

class ApplicationConfigProviderPass implements CompilerPassInterface
{
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
                $providers[$tag['key']] = new Reference($taggedServiceId);
            }
        }

        $aggregatorDefinition = $container->getDefinition('ezsystems.platformui.application_config.aggregator');
        $aggregatorDefinition->addMethodCall('addProviders', [$providers]);
    }
}
