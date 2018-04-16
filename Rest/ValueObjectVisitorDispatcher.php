<?php

/**
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle\Rest;

use eZ\Publish\Core\REST\Common\Output\Generator;
use eZ\Publish\Core\REST\Common\Output\ValueObjectVisitorDispatcher as BaseValueObjectVisitorDispatcher;
use eZ\Publish\Core\REST\Common\Output\Exceptions\NoVisitorFoundException;
use eZ\Publish\Core\REST\Common\Output\Visitor;

class ValueObjectVisitorDispatcher extends BaseValueObjectVisitorDispatcher
{
    /** @var \eZ\Publish\Core\REST\Common\Output\ValueObjectVisitorDispatcher */
    private $parentDispatcher;

    /**
     * ValueObjectVisitorDispatcher constructor.
     *
     * @param \eZ\Publish\Core\REST\Common\Output\ValueObjectVisitorDispatcher $parentDispatcher
     */
    public function __construct(BaseValueObjectVisitorDispatcher $parentDispatcher)
    {
        $this->parentDispatcher = $parentDispatcher;
    }

    public function setOutputVisitor(Visitor $outputVisitor)
    {
        parent::setOutputVisitor($outputVisitor);
        $this->parentDispatcher->setOutputVisitor($outputVisitor);
    }

    public function setOutputGenerator(Generator $outputGenerator)
    {
        parent::setOutputGenerator($outputGenerator);
        $this->parentDispatcher->setOutputGenerator($outputGenerator);
    }

    public function visit($data)
    {
        try {
            return parent::visit($data);
        } catch (NoVisitorFoundException $e) {
            return $this->parentDispatcher->visit($data);
        }
    }
}
