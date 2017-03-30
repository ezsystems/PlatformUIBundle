<?php

/**
 * File containing the EzSystemsPlatformUIBundle class.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle;

use EzSystems\PlatformUIBundle\DependencyInjection\Compiler\ApplicationConfigProviderPass;
use EzSystems\PlatformUIBundle\DependencyInjection\Compiler\TranslationDomainsExtensionsPass;
use EzSystems\PlatformUIBundle\DependencyInjection\EzPlatformUIExtension;
use EzSystems\PlatformUIBundle\Hybrid\DependencyInjection\AdminSiteAccessConfigurationFilter;
use EzSystems\PlatformUIBundle\Hybrid\DependencyInjection\Compiler\AdminSiteaccessPass;
use EzSystems\PlatformUIBundle\Hybrid\DependencyInjection\Compiler\NavigationHubPass;
use EzSystems\PlatformUIBundle\Hybrid\DependencyInjection\Compiler\ToolbarsPass;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\HttpKernel\Bundle\Bundle;

class EzSystemsPlatformUIBundle extends Bundle
{
    protected $name = 'eZPlatformUIBundle';

    public function getContainerExtension()
    {
        return new EzPlatformUIExtension();
    }

    /**
     * Builds the bundle.
     * It is only ever called once when the cache is empty.
     * This method can be overridden to register compilation passes,
     * other extensions, ...
     *
     * @param ContainerBuilder $container A ContainerBuilder instance
     */
    public function build(ContainerBuilder $container)
    {
        parent::build($container);
        $container->addCompilerPass(new ApplicationConfigProviderPass());
        $container->addCompilerPass(new TranslationDomainsExtensionsPass());
        $container->addCompilerPass(new NavigationHubPass());
        $container->addCompilerPass(new ToolbarsPass());
        //$container->addCompilerPass(new AdminSiteaccessPass());

        $eZExtension = $container->getExtension('ezpublish');
        $eZExtension->addSiteAccessConfigurationFilter(
            new AdminSiteAccessConfigurationFilter()
        );
    }
}
