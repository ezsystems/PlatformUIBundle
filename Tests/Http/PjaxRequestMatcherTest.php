<?php
/**
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle\Tests\Http;

use EzSystems\PlatformUIBundle\Http\PjaxRequestMatcher;
use PHPUnit_Framework_TestCase;
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

    public function testMatch()
    {
        $request = new Request();
        $request->headers->set('x-pjax', 'true');

        $this->assertTrue($this->requestMatcher->matches($request));
    }

    public function testNoMatch()
    {
        $request = new Request();

        $this->assertFalse($request->headers->has('x-pjax'));
        $this->assertFalse($this->requestMatcher->matches($request));
    }
}
