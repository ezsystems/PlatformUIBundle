<?php


namespace EzSystems\PlatformUIBundle\Components;

class Trash implements Component, \JsonSerializable
{
    public function getId()
    {
        return 'trash';
    }

    public function getHtml()
    {
        return 'Server side updated at <b>' . date('H:i:s') . '</b>';
    }

    public function getUpdateStruct()
    {
        return $this->getHtml();
    }

    public function jsonSerialize()
    {
        return [
            'id' => $this->getId(),
            'update' => $this->getUpdateStruct(),
        ];
    }
}
