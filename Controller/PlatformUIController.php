<?php
/**
 * File containing the PlatformUIController class.
 *
 * @copyright Copyright (C) 1999-2014 eZ Systems AS. All rights reserved.
 * @license http://www.gnu.org/licenses/gpl-2.0.txt GNU General Public License v2
 * @version //autogentag//
 */

namespace EzSystems\PlatformUIBundle\Controller;

use eZ\Bundle\EzPublishCoreBundle\Controller;

class PlatformUIController extends Controller
{
    /**
     * Renders the "shell" page to run the JavaScript application
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function shellAction()
    {
        return $this->render(
            'eZPlatformUIBundle:PlatformUI:shell.html.twig'
        );
    }
}
