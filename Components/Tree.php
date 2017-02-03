<?php

namespace EzSystems\PlatformUIBundle\Components;

class Tree implements Component, \JsonSerializable
{
    protected $locationId = false;

    public function __construct($request)
    {
        if ($request->attributes->get('location')) {
            $this->locationId = $request->attributes->get('location')->id;
        }
    }

    public function getId()
    {
        return 'tree';
    }

    public function getHtml()
    {
        $selected = $this->locationId ? $this->locationId : 'false';
        // could be rendered with a twig template
        return '<ez-expandable-tree selected-location-id="' . $selected . '">Tree button</ez-expandable-tree>';
    }

    public function getUpdateStruct()
    {
        return [
            'ez-expandable-tree' => [
                'selected-location-id' => $this->locationId,
            ]
        ];
    }

    public function jsonSerialize()
    {
        return [
            'id' => $this->getId(),
            'update' => $this->getUpdateStruct(),
        ];
    }
}
