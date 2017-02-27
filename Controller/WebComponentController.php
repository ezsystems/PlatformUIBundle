<?php

/**
 * File containing the WebComponentController class.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle\Controller;

use EzSystems\PlatformUIBundle\ApplicationConfig\Provider;

class WebComponentController extends Controller
{
    /** @var \EzSystems\PlatformUIBundle\ApplicationConfig\Provider */
    private $configAggregator;

    public function __construct(Provider $configAggregator)
    {
        $this->configAggregator = $configAggregator;
    }

    public function yuiAppComponentAction()
    {
        return $this->render(
            'eZPlatformUIBundle:WebComponent:ez-yui-app.html.twig',
            ['parameters' => $this->configAggregator->getConfig()]
        );
    }
}
