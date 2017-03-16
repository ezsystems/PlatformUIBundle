<?php
/**
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */

namespace EzSystems\PlatformUIBundle\Hybrid\DependencyInjection\Compiler;

use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Reference;

class NavigationHubPass implements CompilerPassInterface
{
    public function process(ContainerBuilder $container)
    {
        if (!$container->hasDefinition('ezsystems.platformui.hybrid.controller.navigation_hub')) {
            return;
        }

        $this->processNavigationHubTag($container, 'ezplatform.ui.zone', 2);
        $this->processNavigationHubTag($container, 'ezplatform.ui.link', 3);
    }

    private function processNavigationHubTag(ContainerBuilder $container, $tag, $index)
    {
        $items = [];
        $services = $container->findTaggedServiceIds($tag);
        foreach (array_keys($services) as $serviceId) {
            $items[] = new Reference($serviceId);
        }

        $container
            ->getDefinition('ezsystems.platformui.hybrid.controller.navigation_hub')
            ->replaceArgument($index, $items);
    }
}
