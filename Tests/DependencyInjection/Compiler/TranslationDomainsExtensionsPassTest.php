<?php
/**
 * File containing the ContentViewPassTest class.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 *
 * @version //autogentag//
 */
namespace EzSystems\PlatformUIBundle\Tests\DependencyInjection\Compiler;

use EzSystems\PlatformUIBundle\DependencyInjection\Compiler\TranslationDomainsExtensionsPass;
use Matthias\SymfonyDependencyInjectionTest\PhpUnit\AbstractCompilerPassTestCase;
use Mockery;
use Symfony\Component\DependencyInjection\ContainerBuilder;

class TranslationDomainsExtensionsPassTest extends AbstractCompilerPassTestCase
{
    /**
     * Register the compiler pass under test, just like you would do inside a bundle's load()
     * method:.
     *
     *   $container->addCompilerPass(new MyCompilerPass());
     */
    protected function registerCompilerPass(ContainerBuilder $container)
    {
        $container->addCompilerPass(new TranslationDomainsExtensionsPass());
    }

    public function testCollectTranslationDomains()
    {
        $extension = Mockery::mock('Symfony\Component\DependencyInjection\Extension\ExtensionInterface,\EzSystems\PlatformUIBundle\DependencyInjection\PlatformUIExtension');
        $extension->shouldReceive('getTranslationDomains')->andReturn(['tenant', 'smith']);
        $extension->shouldReceive('getAlias')->andReturn('extension_one');
        $extension->shouldReceive('getNamespace')->andReturn('Extension\One');
        $this->container->registerExtension($extension);

        $extension = Mockery::mock('Symfony\Component\DependencyInjection\Extension\ExtensionInterface,\EzSystems\PlatformUIBundle\DependencyInjection\PlatformUIExtension');
        $extension->shouldReceive('getTranslationDomains')->andReturn(['eccleston', 'baker']);
        $extension->shouldReceive('getAlias')->andReturn('extension_two');
        $extension->shouldReceive('getNamespace')->andReturn('Extension\Two');
        $this->container->registerExtension($extension);

        $extension = Mockery::mock('Symfony\Component\DependencyInjection\Extension\ExtensionInterface');
        $extension->shouldReceive('getAlias')->andReturn('extension_three');
        $extension->shouldReceive('getNamespace')->andReturn('Extension\Three');
        $extension->shouldNotReceive('getTranslationDomains');
        $this->container->registerExtension($extension);

        $this->compile();
        $this->assertContainerBuilderHasParameter(
            'ez_platformui.translation_domains',
            ['tenant', 'smith', 'eccleston', 'baker']
        );
    }
}
