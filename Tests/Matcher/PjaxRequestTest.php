<?php
/**
 * This file is part of the eZ PlatformUI package.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle\Tests\Matcher\ContentBased;

use EzSystems\PlatformUIBundle\Http\PjaxRequestMatcher;
use EzSystems\PlatformUIBundle\Matcher\PjaxRequest;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;

class PjaxRequestTest extends \PHPUnit_Framework_TestCase
{
    /**
     * @var \EzSystems\PlatformUIBundle\Matcher\PjaxRequest
     */
    private $matcher;

    protected function setUp()
    {
        $this->matcher = new PjaxRequest();
        $this->matcher->setPjaxRequestMatcher(new PjaxRequestMatcher());
    }

    public function testNoMatch()
    {
        $viewMock = $this->getMockBuilder('eZ\Publish\Core\MVC\Symfony\View\View')->getMock();

        $requestStack = new RequestStack();
        $requestStack->push(new Request());

        $this->matcher->setRequestStack($requestStack);

        $this->assertFalse($this->matcher->match($viewMock));
    }

    public function testMatch()
    {
        $viewMock = $this->getMockBuilder('eZ\Publish\Core\MVC\Symfony\View\View')->getMock();

        $requestStack = new RequestStack();
        $this->matcher->setRequestStack($requestStack);

        $pjaxRequest = new Request();
        $pjaxRequest->headers->set('x-pjax', 'true');
        $requestStack->push($pjaxRequest);

        $this->assertTrue($this->matcher->match($viewMock));
    }
}
