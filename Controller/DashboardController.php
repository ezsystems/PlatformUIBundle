<?php
/**
 * File containing the DashboardController class.
 *
 * @copyright Copyright (C) 1999-2014 eZ Systems AS. All rights reserved.
 * @license http://www.gnu.org/licenses/gpl-2.0.txt GNU General Public License v2
 * @version //autogentag//
 */

namespace EzSystems\PlatformUIBundle\Controller;

use eZ\Bundle\EzPublishCoreBundle\Controller;

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
