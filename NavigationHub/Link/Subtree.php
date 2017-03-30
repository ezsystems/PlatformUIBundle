<?php

namespace EzSystems\PlatformUIBundle\NavigationHub\Link;

use Symfony\Component\HttpFoundation\Request;

class Subtree extends Route
{
    public function match(Request $request)
    {
        $location = $request->attributes->get('location');

        return
            $this->matchRoute($this->routeName)
            && $location
            && in_array((string)$this->routeParams['locationId'], $location->path)
        ;
    }
}
