<?php

namespace EzSystems\PlatformUIBundle\Components;

use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Routing\RouterInterface;

class Browse implements Component
{
    protected $router;

    protected $request;

    // passing the router is needed because at the moment the UDW only supports
    // a REST Location id as the starting Location id, so this id is build there
    public function __construct(RequestStack $stack, RouterInterface $router)
    {
        $this->request = $stack->getMasterRequest();
        $this->router = $router;
    }

    protected function getLocationId()
    {
        if ($this->request->attributes->get('location')) {
            return $this->request->attributes->get('location')->id;
        }
        return "false";
    }

    protected function getLocationRestId()
    {
        if ($this->request->attributes->get('location')) {
            return $this->router->generate(
                'ezpublish_rest_loadLocation',
                ['locationPath' => trim($this->request->attributes->get('location')->pathString, '/')]
            );
        }
        return "false";
    }

    public function __toString()
    {
        $selected = $this->getLocationRestId();
        $id = $this->getLocationId();
        // could be rendered with a twig template
        return '<ez-browse selected-location-id="' . $selected . '" location-id="' . $id . '">Browse</ez-browse>';
    }

    public function jsonSerialize()
    {
        return [
            'selector' => 'ez-browse',
            'update' => [
                'attributes' => [
                    'selected-location-id' => $this->getLocationRestId(),
                    'location-id' => $this->getLocationId(),
                ],
            ],
        ];
    }
}
