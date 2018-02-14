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
use Symfony\Component\Translation\TranslatorInterface;

class PlatformUIController extends Controller
{
    /** @var \EzSystems\PlatformUIBundle\ApplicationConfig\Provider */
    private $configAggregator;

    /** @var \EzSystems\PlatformUIBundle\Loader\Loader */
    private $loader;

    /** @var \Symfony\Component\Translation\TranslatorInterface */
    private $translator;

    public function __construct(Provider $configAggregator, Loader $loader, TranslatorInterface $translator)
    {
        $this->configAggregator = $configAggregator;
        $this->loader = $loader;
        $this->translator = $translator;
    }

    /**
     * Renders the "shell" page to run the JavaScript application.
     *
     * @param \Symfony\Component\HttpFoundation\Request $request
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function shellAction(Request $request)
    {
        $this->translator->setLocale($request->getPreferredLanguage() ?: $request->getDefaultLocale());

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

        $version = $this->get('templating.helper.assets')->getVersion();

        try {
            $type = $this->loader->getCombinedFilesContentType($files, $version);
            $content = $this->loader->combineFilesContent($files, $version);
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
