<?php

namespace EzSystems\PlatformUIBundle\Components;

class Search implements Component
{
    public function __toString()
    {
        return '<div>Dumb thing, never updated</div>';
    }

    public function jsonSerialize()
    {
        return false;
    }
}
