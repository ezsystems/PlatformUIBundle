<?php

namespace EzSystems\PlatformUIBundle\Components;

class Search extends Component
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
