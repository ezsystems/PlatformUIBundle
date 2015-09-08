<?php

/**
 * File containing the DashboardController class.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle\Controller;

class DashboardController extends Controller
{
    /**
     * Renders the administration dashboard to be usable by the PlatformUI
     * JavaScript code.
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function dashboardAction()
    {
        return $this->render(
            'eZPlatformUIBundle:Dashboard:dashboard.html.twig'
        );
    }
}
