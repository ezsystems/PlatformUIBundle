<?php
/**
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle\DependencyInjection\Compiler;

use EzSystems\PlatformUIBundle\DependencyInjection\PlatformUIExtension;
use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;

class TranslationDomainsExtensionsPass implements CompilerPassInterface
{
    public function process(ContainerBuilder $container)
    {
        $domains = [];
        foreach ($container->getExtensions() as $extension) {
            if ($extension instanceof PlatformUIExtension) {
                $domains = array_merge($domains, $extension->getTranslationDomains());
            }
        }
        $container->setParameter('ez_platformui.translation_domains', $domains);
    }
}
