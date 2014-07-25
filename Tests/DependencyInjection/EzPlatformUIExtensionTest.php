<?php
/**
 * File containing the EzPlatformUIExtensionTest class.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 * @version //autogentag//
 */

namespace EzSystems\PlatformUIBundle\Tests\DependencyInjection;

use eZ\Bundle\EzPublishCoreBundle\DependencyInjection\Configuration\SiteAccessAware\ConfigurationProcessor;
use eZ\Bundle\EzPublishCoreBundle\DependencyInjection\Configuration\SiteAccessAware\Contextualizer;
use EzSystems\PlatformUIBundle\DependencyInjection\EzPlatformUIExtension;
use Matthias\SymfonyDependencyInjectionTest\PhpUnit\AbstractExtensionTestCase;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\Yaml\Yaml;

class EzPlatformUIExtensionTest extends AbstractExtensionTestCase
{
    protected function getContainerExtensions()
    {
        return array( new EzPlatformUIExtension() );
    }

    public function testGetAlias()
    {
        $extension = new EzPlatformUIExtension();
        $this->assertSame( 'ez_platformui', $extension->getAlias() );
    }

    public function testPrepend()
    {
        $extension = new EzPlatformUIExtension();
        $container = new ContainerBuilder();
        $extension->prepend( $container );

        $this->assertSame(
            array( array( 'bundles' => array( 'eZPlatformUIBundle' ) ) ),
            $container->getExtensionConfig( 'assetic' )
        );

        $defaultYuiConfig = Yaml::parse( file_get_contents( __DIR__ . '/../../Resources/config/yui.yml' ) );
        $this->assertSame(
            array( $defaultYuiConfig ),
            $container->getExtensionConfig( 'ez_platformui' )
        );
    }

    public function testLoadNoConfig()
    {
        $this->load();
        $this->assertContainerBuilderHasParameter( 'ez_platformui.default.yui', array() );
        $this->assertContainerBuilderHasParameter( 'ez_platformui.default.yui.modules', array() );
        $this->assertContainerBuilderHasParameter( 'ez_platformui.default.yui.filter', 'min' );
    }

    public function testLoadWithConfig()
    {
        ConfigurationProcessor::setAvailableSiteAccesses( array( 'sa1', 'sa2', 'sa3' ) );
        ConfigurationProcessor::setGroupsBySiteAccess(
            array(
                'sa2' => array( 'sa_group' ),
                'sa3' => array( 'sa_group' ),
            )
        );

        $defaultFilter = 'raw';
        $ezcapiDefaultPath = 'foo/bar.js';
        $foobarDefaultPath = 'js/foobar.js';
        $defaultModules = array(
            'ez-capi' => array(
                'path' => $ezcapiDefaultPath
            ),
            'foobar' => array(
                'path' => $foobarDefaultPath
            )
        );

        $filterSa1 = 'min';
        $ezcapiRequiresSa1 = array( 'some-module' );
        $moduleSa1Path = 'js/module_sa1.js';
        $moduleSa1DepOf = array( 'ez-capi' );
        $moduleSa1Requires = array( 'foobar' );
        $modulesSa1 = array(
            'ez-capi' => array(
                'requires' => $ezcapiRequiresSa1
            ),
            'module-sa1' => array(
                'path' => $moduleSa1Path,
                'dependencyOf' => $moduleSa1DepOf,
                'requires' => $moduleSa1Requires
            )
        );

        $filterSa2 = 'debug';
        $moduleSa2Path = 'js/module_sa2.js';
        $moduleSa2Requires = array( 'ez-capi' );
        $modulesSa2 = array(
            'module-sa2' => array(
                'path' => $moduleSa2Path,
                'requires' => $moduleSa2Requires
            )
        );

        $filterSaGroup = 'min';
        $ezcapiGroupDepOf = array( 'another-module' );
        $moduleGroupPath = 'js/module_sagroup.js';
        $moduleGroupRequires = array( 'foobar' );
        $moduleGroupDepOf = array( 'ez-capi' );
        $modulesSaGroup = array(
            'ez-capi' => array(
                'dependencyOf' => $ezcapiGroupDepOf
            ),
            'module-sagroup' => array(
                'path' => $moduleGroupPath,
                'requires' => $moduleGroupRequires,
                'dependencyOf' => $moduleGroupDepOf
            )
        );

        $config = array(
            'system' => array(
                'default' => array(
                    'yui' => array(
                        'filter' => $defaultFilter,
                        'modules' => $defaultModules
                    )
                ),
                'sa1' => array(
                    'yui' => array(
                        'filter' => $filterSa1,
                        'modules' => $modulesSa1
                    )
                ),
                'sa2' => array(
                    'yui' => array(
                        'filter' => $filterSa2,
                        'modules' => $modulesSa2
                    )
                ),
                'sa_group' => array(
                    'yui' => array(
                        'filter' => $filterSaGroup,
                        'modules' => $modulesSaGroup
                    )
                )
            )
        );

        $this->load( $config );

        // Default
        $this->assertContainerBuilderHasParameter( "ez_platformui.default.yui.filter", $defaultFilter );
        $this->assertContainerBuilderHasParameter( "ez_platformui.default.yui.modules", array_keys( $defaultModules ) );
        $this->assertContainerBuilderHasParameter( "ez_platformui.default.yui.modules.ez-capi.path", $ezcapiDefaultPath );
        $this->assertFalse( $this->container->hasParameter( 'ez_platformui.default.yui.modules.ez-capi.requires' ) );
        $this->assertFalse( $this->container->hasParameter( 'ez_platformui.default.yui.modules.ez-capi.dependencyOf' ) );
        $this->assertContainerBuilderHasParameter( "ez_platformui.default.yui.modules.foobar.path", $foobarDefaultPath );
        $this->assertFalse( $this->container->hasParameter( 'ez_platformui.default.yui.modules.foobar.requires' ) );
        $this->assertFalse( $this->container->hasParameter( 'ez_platformui.default.yui.modules.foobar.dependencyOf' ) );

        // SA1
        $this->assertContainerBuilderHasParameter( "ez_platformui.sa1.yui.filter", $filterSa1 );
        $this->assertContainerBuilderHasParameter(
            "ez_platformui.sa1.yui.modules",
            array( 'ez-capi', 'foobar', 'module-sa1' )
        );
        $this->assertContainerBuilderHasParameter(
            'ez_platformui.sa1.yui.modules.ez-capi.requires',
            $ezcapiRequiresSa1
        );
        $this->assertContainerBuilderHasParameter(
            'ez_platformui.sa1.yui.modules.module-sa1.requires',
            $moduleSa1Requires
        );
        $this->assertContainerBuilderHasParameter(
            'ez_platformui.sa1.yui.modules.module-sa1.path',
            $moduleSa1Path
        );
        $this->assertContainerBuilderHasParameter(
            'ez_platformui.sa1.yui.modules.module-sa1.dependencyOf',
            $moduleSa1DepOf
        );

        // SA2
        $this->assertContainerBuilderHasParameter( "ez_platformui.sa2.yui.filter", $filterSa2 );
        $this->assertContainerBuilderHasParameter(
            "ez_platformui.sa2.yui.modules",
            array( 'ez-capi', 'foobar', 'module-sagroup', 'module-sa2' )
        );
        $this->assertFalse( $this->container->hasParameter( 'ez_platformui.sa2.yui.modules.ez-capi.path' ) );
        $this->assertContainerBuilderHasParameter( 'ez_platformui.sa2.yui.modules.ez-capi.requires', array() );
        $this->assertContainerBuilderHasParameter( 'ez_platformui.sa2.yui.modules.ez-capi.dependencyOf', $ezcapiGroupDepOf );
        $this->assertContainerBuilderHasParameter( 'ez_platformui.sa2.yui.modules.module-sa2.path', $moduleSa2Path );
        $this->assertContainerBuilderHasParameter( 'ez_platformui.sa2.yui.modules.module-sa2.requires', $moduleSa2Requires );
        $this->assertContainerBuilderHasParameter( 'ez_platformui.sa2.yui.modules.module-sa2.dependencyOf', array() );
        $this->assertFalse( $this->container->hasParameter( 'ez_platformui.sa2.yui.modules.module-sagroup.path' ) );
        $this->assertContainerBuilderHasParameter( 'ez_platformui.sa2.yui.modules.module-sagroup.requires', $moduleGroupRequires );
        $this->assertContainerBuilderHasParameter( 'ez_platformui.sa2.yui.modules.module-sagroup.dependencyOf', $moduleGroupDepOf );

        // SA3
        $this->assertFalse( $this->container->hasParameter( 'ez_platformui.sa3.yui.filter' ) );
        $this->assertContainerBuilderHasParameter(
            "ez_platformui.sa3.yui.modules",
            array( 'ez-capi', 'foobar', 'module-sagroup' )
        );
        $this->assertFalse( $this->container->hasParameter( 'ez_platformui.sa3.yui.modules.ez-capi.path' ) );
        $this->assertContainerBuilderHasParameter( 'ez_platformui.sa3.yui.modules.ez-capi.requires', array() );
        $this->assertContainerBuilderHasParameter( 'ez_platformui.sa3.yui.modules.ez-capi.dependencyOf', $ezcapiGroupDepOf );
        $this->assertFalse( $this->container->hasParameter( 'ez_platformui.sa3.yui.modules.module-sagroup.path' ) );
        $this->assertContainerBuilderHasParameter( 'ez_platformui.sa3.yui.modules.module-sagroup.requires', $moduleGroupRequires );
        $this->assertContainerBuilderHasParameter( 'ez_platformui.sa3.yui.modules.module-sagroup.dependencyOf', $moduleGroupDepOf );

        // SA group
        $this->assertContainerBuilderHasParameter( 'ez_platformui.sa_group.yui.filter', $filterSaGroup );
        $this->assertContainerBuilderHasParameter(
            "ez_platformui.sa3.yui.modules",
            array( 'ez-capi', 'foobar', 'module-sagroup' )
        );
        $this->assertFalse( $this->container->hasParameter( 'ez_platformui.sa_group.yui.modules.ez-capi.path' ) );
        $this->assertFalse( $this->container->hasParameter( 'ez_platformui.sa_group.yui.modules.ez-capi.requires' ) );
        $this->assertFalse( $this->container->has( 'ez_platformui.sa_group.yui.modules.ez-capi.dependencyOf' ) );
        $this->assertContainerBuilderHasParameter( 'ez_platformui.sa_group.yui.modules.module-sagroup.path', $moduleGroupPath );
        $this->assertFalse( $this->container->has( 'ez_platformui.sa_group.yui.modules.module-sagroup.dependencyOf' ) );
        $this->assertFalse( $this->container->has( 'ez_platformui.sa_group.yui.modules.module-sagroup.requires' ) );
    }
}
