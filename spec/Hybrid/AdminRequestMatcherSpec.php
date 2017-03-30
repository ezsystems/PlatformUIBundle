<?php

namespace spec\EzSystems\PlatformUIBundle\Hybrid;

use EzSystems\PlatformUIBundle\Hybrid\AdminRequestMatcher;
use PhpSpec\ObjectBehavior;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestMatcherInterface;

/**
 * @method bool matches(Request $request)
 */
class AdminRequestMatcherSpec extends ObjectBehavior
{
    function it_is_initializable()
    {
        $this->shouldHaveType(AdminRequestMatcher::class);
        $this->shouldHaveType(RequestMatcherInterface::class);
    }

    function it_matches_requests_to_the_admin_siteaccess(
        Request $request
    ) {
        $request->getRequestUri()->willReturn('/admin/foo');
        $this->matches($request)->shouldEqual(true);
    }
}
