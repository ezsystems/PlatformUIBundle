<?php

/**
 * File containing the DashboardController class.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use EzSystems\PlatformUIBundle\Components\Component;
use EzSystems\PlatformUIBundle\Components\NavigationHub;
use EzSystems\PlatformUIBundle\Components\MainContent;
use eZ\Publish\API\Repository\Values\Content\Location;

class ProtoController extends Controller
{
    protected $toolbars;

    protected $navigationHub;

    protected $mainContent;

    public function __construct(MainContent $content, NavigationHub $navigationHub, array $toolbars)
    {
        $this->mainContent = $content;
        $this->navigationHub = $navigationHub;
        $this->toolbars = $toolbars;
    }

    protected function setToolbarsVisibility($config)
    {
        foreach ($this->toolbars as $toolbar) {
            $toolbar->setVisible((bool)$config[$toolbar->getId()]);
        }
    }

    public function dashboardAction(Request $request)
    {
        $this->setToolbarsVisibility($request->attributes->get('toolbars'));
        $this->mainContent->setTemplate(
            'eZPlatformUIBundle:PlatformUI:dashboard.html.twig'
        );
        $parameters = [
            'title' => 'Dashboard',
            'navigationHub' => $this->navigationHub,
            'toolbars' => $this->toolbars,
            'mainContent' => $this->mainContent,
        ];
        if ($request->headers->has('x-ajax-update')) {
            return JsonResponse::create($parameters);
        }

        return $this->render('eZPlatformUIBundle:PlatformUI:proto.html.twig', $parameters);
    }

    public function locationViewAction(Request $request, Location $location)
    {
        $this->setToolbarsVisibility($request->attributes->get('toolbars'));
        $this->mainContent->setTemplate(
            'eZPlatformUIBundle:PlatformUI:locationview.html.twig'
        );
        $this->mainContent->setParameters(['location' => $location]);
        $parameters = [
            'title' => $location->contentInfo->name,
            'navigationHub' => $this->navigationHub,
            'toolbars' => $this->toolbars,
            'mainContent' => $this->mainContent,
        ];
        if ($request->headers->has('x-ajax-update')) {
            return JsonResponse::create($parameters);
        }

        return $this->render('eZPlatformUIBundle:PlatformUI:proto.html.twig', $parameters);
    }
}
