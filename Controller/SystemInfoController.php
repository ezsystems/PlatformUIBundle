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

    /**
     * @var string
     */
    private $installDir;

    public function __construct(SystemInfoHelperInterface $systemInfoHelper, $installDir)
    {
        $this->systemInfoHelper = $systemInfoHelper;
        $this->installDir = $installDir;
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
            'composerInfo' => $this->getComposerInfo(),
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

    /**
     * Getting composer package info for use in tempaltes.
     *
     * @return array
     */
    private function getComposerInfo()
    {
        if (!file_exists($this->installDir . 'composer.lock')) {
            return [];
        }

        $packages = [];
        $lockData = json_decode(file_get_contents($this->installDir . 'composer.lock'), true);
        foreach ($lockData['packages'] as $packageData) {
            $packages[$packageData['name']] = [
                'version' => $packageData['version'],
                'time' => $packageData['time'],
                'homepage' => isset($packageData['homepage']) ? $packageData['homepage'] : '',
                'reference' => $packageData['source']['reference'],
            ];
        }

        ksort($packages, SORT_FLAG_CASE | SORT_STRING);

        return $packages;
    }
}
