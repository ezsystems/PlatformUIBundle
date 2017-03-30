<?php
namespace EzSystems\PlatformUIBundle\NavigationHub\Link;

use EzSystems\PlatformUIBundle\NavigationHub\Link;
use Symfony\Component\HttpFoundation\Request;

class Route extends Link
{
    protected $router;

    protected $routeName;

    protected $routeParams;

    public function __construct($router, $routeName, $routeParams, $name, $zoneIdentifier)
    {
        $this->router = $router;
        $this->zone = $zoneIdentifier;
        $this->name = $name;
        $this->routeName = $routeName;
        $this->routeParams = $routeParams;
    }

    public function getUrl()
    {
        return $this->router->generate($this->routeName, $this->routeParams);
    }

    public function match(Request $request)
    {
        $routeName = $request->attributes->get('_route');
        $routeParams = $request->attributes->get('_routeParams', []);

        return (
            $this->matchRoute($routeName)
            && $this->matchRouteParams($routeParams)
        );
    }

    protected function matchRoute($routeName)
    {
        return $routeName === $this->routeName;
    }

    protected function matchRouteParams($params)
    {
        if (count($params) !== count($this->routeParams)) {
            return false;
        }
        foreach ($params as $name => $value) {
            if (!isset($this->routeParams[$name]) || $this->routeParams[$name] !== $value) {
                return false;
            }
        }
        return true;
    }
}
