<?php

namespace EzSystems\PlatformUIBundle\Components;

class Trash extends Component
{
    public function __toString()
    {
        return '<div class="ez-trash-button">Server side updated at <b>' . date('H:i:s') . '</b></div>';
    }

    public function jsonSerialize()
    {
        return [
            'selector' => '.ez-trash-button',
            'update' => (string)$this,
        ];
    }
}
