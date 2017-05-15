<?php
/**
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle\Tests\Http;

use EzSystems\PlatformUIBundle\Http\PjaxRequestMatcher;
use PHPUnit_Framework_TestCase;
use Symfony\Component\HttpFoundation\HeaderBag;
use Symfony\Component\HttpFoundation\Request;

class PjaxRequestMatcherTest extends PHPUnit_Framework_TestCase
{
    /**
     * @var PjaxRequestMatcher
     */
    private $requestMatcher;

    protected function setUp()
    {
        $this->requestMatcher = new PjaxRequestMatcher();
    }

    public function testMatchOnHeader()
    {
        $request = new Request();
        $request->headers = $this->getMock(HeaderBag::class);
        $request->headers
            ->expects($this->once())
            ->method('has')
            ->with('x-pjax')
            ->will($this->returnValue(true));

        $this->assertTrue($this->requestMatcher->matches($request));
    }

    public function testMatchOnRequestUri()
    {
        $request = $this->getMock(Request::class);
        $request->headers = $this->getMock(HeaderBag::class);
        $request->headers
            ->expects($this->once())
            ->method('has')
            ->with('x-pjax')
            ->will($this->returnValue(false));
        $request
            ->expects($this->once())
            ->method('getRequestUri')
            ->will($this->returnValue('/pjax/request'));

        $this->assertTrue($this->requestMatcher->matches($request));
    }

    public function testNoMatch()
    {
        $request = new Request();

        $this->assertFalse($request->headers->has('x-pjax'));
        $this->assertFalse($this->requestMatcher->matches($request));
    }
}
