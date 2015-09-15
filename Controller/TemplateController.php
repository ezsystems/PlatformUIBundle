<?php

/**
 * File containing the TemplateController class.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle\Controller;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use eZ\Publish\Core\MVC\ConfigResolverInterface;

/**
 * Provides a controller to automatically wrap the Handlebars templates in a YUI
 * module.
 */
class TemplateController extends Controller
{
    /**
     * @var \eZ\Publish\Core\MVC\ConfigResolverInterface
     */
    private $configResolver;

    public function __construct(ConfigResolverInterface $configResolver)
    {
        $this->configResolver = $configResolver;
    }

    /**
     * Wraps the template file content in a YUI module. The generated module
     * also registers the template under the same name of the module.
     *
     * @throws \Symfony\Component\HttpKernel\Exception\BadRequestHttpException
     * if the module is not declared as a template
     *
     * @param string $module
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function wrapTemplateAction($module)
    {
        if ($this->getModuleSetting($module, 'type') !== 'template') {
            throw new BadRequestHttpException($module . ' is not declared as a template');
        }
        $path = $this->getModuleSetting($module, 'path');
        $response = new Response();

        return $this->render('eZPlatformUIBundle:Template:wraptemplate.js.twig', [
            'path' => $path,
            'module' => $module,
            'templateCode' => file_get_contents($path),
        ], $response);
    }

    private function getModuleSetting($module, $setting)
    {
        return $this->configResolver->getParameter("yui.modules.$module.$setting", 'ez_platformui');
    }

    public function performAccessChecks()
    {
        return;
    }
}
