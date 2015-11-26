<?php

/**
 * File containing the PlatformUIController class.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle\Controller;

use eZ\Publish\API\Repository\Exceptions\NotFoundException;
use eZ\Publish\Core\Base\Exceptions\InvalidArgumentValue;
use EzSystems\PlatformUIBundle\ApplicationConfig\Provider;
use EzSystems\PlatformUIBundle\Loader\Loader;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class PlatformUIController extends Controller
{
    /** @var \EzSystems\PlatformUIBundle\ApplicationConfig\Provider */
    private $configAggregator;

    /** @var \EzSystems\PlatformUIBundle\Loader\Loader */
    private $loader;

    public function __construct(Provider $configAggregator, Loader $loader)
    {
        $this->configAggregator = $configAggregator;
        $this->loader = $loader;
    }

    /**
     * Renders the "shell" page to run the JavaScript application.
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function shellAction()
    {
        return $this->render(
            'eZPlatformUIBundle:PlatformUI:shell.html.twig',
            ['parameters' => $this->configAggregator->getConfig()]
        );
    }

    /**
     * Load JS or CSS assets.
     *
     * @param \Symfony\Component\HttpFoundation\Request $request
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function combineLoaderAction(Request $request)
    {
        $files = array_keys($request->query->all());

        try {
            $type = $this->loader->getCombinedFilesContentType($files);
            $content = $this->loader->combineFilesContent($files);
        } catch (NotFoundException $e) {
            throw new NotFoundHttpException($e->getMessage());
        } catch (InvalidArgumentValue $e) {
            throw new BadRequestHttpException($e->getMessage());
        }

        return new Response(
            $content,
            Response::HTTP_OK,
            ['Content-Type' => $type]
        );
    }

    public function performAccessChecks()
    {
        return;
    }
}
