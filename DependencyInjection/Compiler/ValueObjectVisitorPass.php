<?php

/**
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle\DependencyInjection\Compiler;

use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Reference;

/**
 * Compiler pass for the ezsystems.platformui.value_object_visitor tag used to
 * map an fully qualified class to a value object visitor.
 */
class ValueObjectVisitorPass implements CompilerPassInterface
{
    const TAG_NAME = 'ezsystems.platformui.value_object_visitor';
    const DISPATCHER_DEFINITION_ID = 'ezsystems.platformui.rest.output.value_object_visitor.dispatcher';

    public function process(ContainerBuilder $container)
    {
        if (!$container->hasDefinition(self::DISPATCHER_DEFINITION_ID)) {
            return;
        }

        $definition = $container->getDefinition(self::DISPATCHER_DEFINITION_ID);
        foreach ($container->findTaggedServiceIds(self::TAG_NAME) as $id => $attributes) {
            foreach ($attributes as $attribute) {
                if (!isset($attribute['type'])) {
                    throw new \LogicException(self::TAG_NAME . ' service tag needs a "type" attribute to identify the field type. None given.');
                }

                $definition->addMethodCall(
                    'addVisitor',
                    [$attribute['type'], new Reference($id)]
                );
            }
        }
    }
}
