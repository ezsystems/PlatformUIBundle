<?php

namespace EzSystems\PlatformUIBundle\Hybrid;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestMatcherInterface;

class AdminRequestMatcher implements RequestMatcherInterface
{
    public function matches(Request $request)
    {
        return strpos($request->getRequestUri(), '/admin') === 0;
    }
}
