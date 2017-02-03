<?php


namespace EzSystems\PlatformUIBundle\Components;

class Search implements Component, \JsonSerializable
{
    public function getId()
    {
        return 'search';
    }

    public function getHtml()
    {
        return 'Dumb thing, never updated';
    }

    public function getUpdateStruct()
    {
        return false; // never updated
    }

    public function jsonSerialize()
    {
        return [
            'id' => $this->getId(),
            'update' => $this->getUpdateStruct(),
        ];
    }
}
