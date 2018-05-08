<?php

/**
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle\Tests\DependencyInjection\Compiler;

use EzSystems\PlatformUIBundle\DependencyInjection\Compiler\ValueObjectVisitorPass;
use Matthias\SymfonyDependencyInjectionTest\PhpUnit\AbstractCompilerPassTestCase;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Definition;
use Symfony\Component\DependencyInjection\Reference;

class ValueObjectVisitorPassTest extends AbstractCompilerPassTestCase
{
    protected function registerCompilerPass(ContainerBuilder $container)
    {
        $container->addCompilerPass(new ValueObjectVisitorPass());
    }

    public function testProcess()
    {
        $dispatcherDefinition = new Definition();

        $visitorId = 'ezsystems.platformui.rest.output.value_object_visitor.test';
        $visitorDefinition = new Definition();
        $visitorDefinition->addTag(ValueObjectVisitorPass::TAG_NAME, [
            'type' => 'test', ]
        );

        $containerBuilder = new ContainerBuilder();
        $containerBuilder->addDefinitions([
            ValueObjectVisitorPass::DISPATCHER_DEFINITION_ID => $dispatcherDefinition,
            $visitorId => $visitorDefinition,
        ]);

        $compilerPass = new ValueObjectVisitorPass();
        $compilerPass->process($containerBuilder);

        $dispatcherMethodCalls = $dispatcherDefinition->getMethodCalls();

        $this->assertTrue(isset($dispatcherMethodCalls[0][0]), 'Failed asserting that dispatcher has a method call');
        $this->assertEquals('addVisitor', $dispatcherMethodCalls[0][0], "Failed asserting that called method is 'addVisitor'");
        $this->assertInstanceOf(Reference::class, $dispatcherMethodCalls[0][1][1], 'Failed asserting that method call is to a Reference object');
        $this->assertEquals($visitorId, $dispatcherMethodCalls[0][1][1]->__toString(), "Failed asserting that Referenced service is '$visitorId'");
    }
}
