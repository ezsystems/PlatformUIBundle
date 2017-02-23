<?php

namespace EzSystems\PlatformUIBundle\Components;

use Symfony\Component\Routing\RouterInterface;

class Browse implements Component, \JsonSerializable
{
    protected $locationId = false;

    // passing the router is needed because at the moment the UDW only supports
    // a REST Location id as the starting Location id, so this id is build there
    public function __construct($request, RouterInterface $router)
    {
        if ($request->attributes->get('location')) {
            $this->locationId = $request->attributes->get('location')->id;
            $this->locationRestId = $router->generate(
                'ezpublish_rest_loadLocation',
                ['locationPath' => trim($request->attributes->get('location')->pathString, '/')]
            );
        }
    }

    public function getId()
    {
        return 'tree';
    }

    public function getHtml()
    {
        $selected = $this->locationRestId ? $this->locationRestId : 'false';
        $id = $this->locationId ? $this->locationId : 'false';
        // could be rendered with a twig template
        return '<ez-browse selected-location-id="' . $selected . '" location-id="' . $id . '">Browse</ez-browse>';
    }

    public function getUpdateStruct()
    {
        return [
            'ez-browse' => [
                'selected-location-id' => $this->locationRestId,
                'location-id' => $this->locationId,
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
