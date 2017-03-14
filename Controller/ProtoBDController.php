<?php

/**
 * File containing the DashboardController class.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle\Controller;

use eZ\Publish\Core\MVC\Symfony\View\ContentView;
use EzSystems\PlatformUIBundle\Components\App;
use EzSystems\PlatformUIBundle\Hybrid\View\HybridUiView;
use Symfony\Component\HttpFoundation\Request;

class ProtoBDController extends Controller
{
    public function dashboardAction()
    {
        return new HybridUiView(
            'eZPlatformUIBundle:PlatformUI:dashboard.html.twig',
            [],
            'Dashboard'
        );
    }

    public function locationViewAction(Request $request, ContentView $view)
    {
        $hybridView = new HybridUiView(
            $view->getTemplateIdentifier(),
            $view->getParameters(),
            $view->getContent()->contentInfo->name
        );
        $hybridView->enableToolbar('discovery');

        $request->attributes->set('view', $hybridView);

        return $hybridView;
    }
}
