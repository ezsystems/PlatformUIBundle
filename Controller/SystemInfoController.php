<?php
/**
 * File containing the SystemInfoController class.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */

namespace EzSystems\PlatformUIBundle\Controller;

use eZ\Publish\Core\MVC\Symfony\Security\Authorization\Attribute as AuthorizationAttribute;
use Symfony\Component\HttpFoundation\Response;
use eZ\Bundle\EzPublishCoreBundle\Controller;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use EzSystems\PlatformUIBundle\Helper\SystemInfoHelperInterface;

class SystemInfoController extends Controller
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
        if ( !$this->hasAccess() )
        {
            return $this->forward( 'eZPlatformUIBundle:Pjax:accessDenied' );
        }

        return $this->render(
            'eZPlatformUIBundle:SystemInfo:info.html.twig',
            array(
                'ezplatformInfo' => $this->systemInfoHelper->getEzPlatformInfo(),
                'systemInfo' => $this->systemInfoHelper->getSystemInfo(),
            )
        );
    }

    /**
     * Renders a PHP info page
     *
     * @throws \Symfony\Component\Security\Core\Exception\AccessDeniedException
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
