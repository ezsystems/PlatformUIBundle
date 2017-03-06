<?php

namespace EzSystems\PlatformUIBundle\Components;

interface Component extends \JsonSerializable
{
    public function __toString();
}
