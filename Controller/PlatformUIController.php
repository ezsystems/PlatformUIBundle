<?php

/**
 * File containing the PlatformUIController class.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle\Controller;

use EzSystems\PlatformUIBundle\ApplicationConfig\Provider;

class PlatformUIController extends Controller
{
    /** @var Provider */
    private $configAggregator;

    public function __construct(Provider $configAggregator)
    {
        $this->configAggregator = $configAggregator;
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

    public function performAccessChecks()
    {
        return;
    }
}
