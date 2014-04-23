<?php
/**
 * File containing the SystemInfoController class.
 *
 * @copyright Copyright (C) 1999-2014 eZ Systems AS. All rights reserved.
 * @license http://www.gnu.org/licenses/gpl-2.0.txt GNU General Public License v2
 * @version //autogentag//
 */

namespace EzSystems\PlatformUIBundle\Controller;

use eZ\Publish\Core\MVC\Symfony\Security\Authorization\Attribute as AuthorizationAttribute;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use EzSystems\PlatformUIBundle\Controller\PjaxController;
use EzSystems\PlatformUIBundle\Helper\SystemInfoHelperInterface;

class SystemInfoController extends PjaxController
{
    /**
     * @var \EzSystems\PlatformUIBundle\Helper\SystemInfoHelperInterface
     */
    protected $systemInfoHelper;

    public function __construct( SystemInfoHelperInterface $systemInfoHelper )
    {
        $this->systemInfoHelper = $systemInfoHelper;
    }

    /**
     * Renders the system information page
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function infoAction()
    {
        $response = new Response();
        if ( !$this->hasAccess() )
        {
            $response->setStatusCode( $this->getNoAccessStatusCode() );
            return $response;
        }

        return $this->render(
            'eZPlatformUIBundle:SystemInfo:info.html.twig',
            array(
                'ezplatformInfo' => $this->systemInfoHelper->getEzPlatformInfo(),
                'systemInfo' => $this->systemInfoHelper->getSystemInfo(),
            ),
            $response
        );
    }

    /**
     * Renders a PHP info page
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function phpinfoAction()
    {
        if ( !$this->hasAccess() )
        {
            throw new AccessDeniedException();
        }

        ob_start();
        phpinfo();
        $response = new Response( ob_get_clean() );
        return $response;
    }

    /**
     * Checks whether the current user has access to the actions in this
     * controller, currently checks for the setup/system_info policy.
     *
     * @return boolean
     */
    protected function hasAccess()
    {
        return $this->isGranted(
            new AuthorizationAttribute( 'setup', 'system_info' )
        );
    }
}
