<?php

namespace EzSystems\PlatformUIBundle\NavigationHub;

use Symfony\Component\HttpFoundation\Request;

abstract class Link
{
    public $zone;

    public $name;

    abstract public function match(Request $request);
}
