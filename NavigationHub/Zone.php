<?php

namespace EzSystems\PlatformUIBundle\NavigationHub;

class Zone
{
    public $name;

    public $identifier;

    public function __construct($name, $identifier)
    {
        $this->name = $name;
        $this->identifier = $identifier;
    }
}
