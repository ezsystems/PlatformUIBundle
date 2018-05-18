<?php

/**
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle\Tests\Rest;

use eZ\Publish\Core\REST\Common\Output\Generator;
use eZ\Publish\Core\REST\Common\Output\ValueObjectVisitor;
use eZ\Publish\Core\REST\Common\Output\Visitor;
use EzSystems\PlatformUIBundle\Rest\ValueObjectVisitorDispatcher;
use PHPUnit\Framework\TestCase;
use eZ\Publish\Core\REST\Common\Output\ValueObjectVisitorDispatcher as BaseValueObjectVisitorDispatcher;
use stdClass;

class ValueObjectVisitorDispatcherTest extends TestCase
{
    public function testSetOutputVisitor()
    {
        $outputVisitor = $this
            ->getMockBuilder(Visitor::class)
            ->disableOriginalConstructor()
            ->getMock();

        $parentDispatcher = $this->getMock(BaseValueObjectVisitorDispatcher::class);
        $parentDispatcher
            ->expects($this->once())
            ->method('setOutputVisitor')
            ->with($outputVisitor);

        $dispatcher = new ValueObjectVisitorDispatcher($parentDispatcher);
        $dispatcher->setOutputVisitor($outputVisitor);
    }

    public function testSetOutputGenerator()
    {
        $generator = $this->getMock(Generator::class);

        $parentDispatcher = $this->getMock(BaseValueObjectVisitorDispatcher::class);
        $parentDispatcher
            ->expects($this->once())
            ->method('setOutputGenerator')
            ->with($generator);

        $dispatcher = new ValueObjectVisitorDispatcher($parentDispatcher);
        $dispatcher->setOutputGenerator($generator);
    }

    public function testVisit()
    {
        $data = new stdClass();

        $parentDispatcher = $this->getMock(BaseValueObjectVisitorDispatcher::class);
        $parentDispatcher
            ->expects($this->never())
            ->method('visit')
            ->with($data);

        $outputGenerator = $this->getMock(Generator::class);
        $outputVisitor = $this
            ->getMockBuilder(Visitor::class)
            ->disableOriginalConstructor()
            ->getMock();

        $visitor = $this->getMock(ValueObjectVisitor::class);
        $visitor
            ->expects($this->once())
            ->method('visit')
            ->with($outputVisitor, $outputGenerator, $data);

        $dispatcher = new ValueObjectVisitorDispatcher($parentDispatcher);
        $dispatcher->setOutputGenerator($outputGenerator);
        $dispatcher->setOutputVisitor($outputVisitor);
        $dispatcher->addVisitor('stdClass', $visitor);
        $dispatcher->visit($data);
    }

    public function testVisitCallParentDispatcher()
    {
        $data = new stdClass();

        $parentDispatcher = $this->getMock(BaseValueObjectVisitorDispatcher::class);
        $parentDispatcher
            ->expects($this->once())
            ->method('visit')
            ->with($data);

        $dispatcher = new ValueObjectVisitorDispatcher($parentDispatcher);
        $dispatcher->visit($data);
    }
}
