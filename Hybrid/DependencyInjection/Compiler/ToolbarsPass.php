<?php
/**
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */

namespace EzSystems\PlatformUIBundle\Hybrid\DependencyInjection\Compiler;

use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Reference;
use LogicException;

class ToolbarsPass implements CompilerPassInterface
{
    public function process(ContainerBuilder $container)
    {
        if (!$container->hasDefinition('ezsystems.platformui.hybrid.controller.toolbars')) {
            return;
        }

        $toolbars = [];
        $services = $container->findTaggedServiceIds('ezplatform.ui.toolbar_item');
        foreach ($services as $serviceId => $tags) {
            foreach ($tags as $tag) {
                if (!isset($tag['toolbar'])) {
                    throw new LogicException("Missing mandatory tag attribute 'toolbar'");
                }
                $toolbars[$tag['toolbar']][] = new Reference($serviceId);
            }
        }

        $container
            ->getDefinition('ezsystems.platformui.hybrid.controller.toolbars')
            ->replaceArgument(0, $toolbars);
    }
}
