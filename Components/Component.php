<?php

namespace EzSystems\PlatformUIBundle\Components;

interface Component
{
    public function getHtml();

    public function getUpdateStruct();

    public function getId();
}
