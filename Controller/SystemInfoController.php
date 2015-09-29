<?php

/**
 * File containing the SystemInfoController class.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle\Controller;

use eZ\Publish\Core\MVC\Symfony\Security\Authorization\Attribute;
use Symfony\Component\HttpFoundation\Response;
use EzSystems\PlatformUIBundle\Helper\SystemInfoHelperInterface;

class SystemInfoController extends Controller
{
    /**
     * @var \EzSystems\PlatformUIBundle\Helper\SystemInfoHelperInterface
     */
    protected $systemInfoHelper;

    public function __construct(SystemInfoHelperInterface $systemInfoHelper)
    {
        $this->systemInfoHelper = $systemInfoHelper;
    }

    public function performAccessChecks()
    {
        parent::performAccessChecks();
        $this->denyAccessUnlessGranted(new Attribute('setup', 'system_info'));
    }

    /**
     * Renders the system information page.
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function infoAction()
    {
        return $this->render('eZPlatformUIBundle:SystemInfo:info.html.twig', [
            'ezplatformInfo' => $this->systemInfoHelper->getEzPlatformInfo(),
            'systemInfo' => $this->systemInfoHelper->getSystemInfo(),
        ]);
    }

    /**
     * Renders a PHP info page.
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function phpinfoAction()
    {
        ob_start();
        phpinfo();
        $response = new Response(ob_get_clean());

        return $response;
    }
}
