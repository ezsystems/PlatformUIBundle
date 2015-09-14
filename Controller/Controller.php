<?php
/**
 * This file is part of the eZ PlatformUI package.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 * @version //autogentag//
 */
namespace EzSystems\PlatformUIBundle\Controller;

use EzSystems\PlatformUIBundle\Http\FormProcessingDoneResponse;
use EzSystems\PlatformUIBundle\Notification\NotificationPoolAware;
use eZ\Bundle\EzPublishCoreBundle\Controller as BaseController;

abstract class Controller extends BaseController
{
    use NotificationPoolAware;

    /**
     * Ensures that only authenticated users can access to controller.
     * It is not needed to call this method from actions
     * as it's already called from base controller service.
     *
     * @see ezsystems.platformui.controller.base service definition.
     */
    public function performAccessChecks()
    {
        $this->denyAccessUnlessGranted('IS_AUTHENTICATED_REMEMBERED');
    }

    /**
     * Returns a PJAX specific redirect response (HTTP 205 with PJAX-Location header).
     * Performs a redirect to $url.
     * Use this method after form processing.
     *
     * @param string $url
     *
     * @return FormProcessingDoneResponse
     */
    protected function redirectAfterFormPost($url)
    {
        return new FormProcessingDoneResponse($url);
    }

    /**
     * Performs a redirect to $routeName.
     * Use this method after form processing.
     *
     * @param string $routeName
     * @param array $params Hash of parameters to generate the route.
     *
     * @return FormProcessingDoneResponse
     */
    protected function redirectToRouteAfterFormPost($routeName, array $params = [])
    {
        return $this->redirectAfterFormPost($this->generateUrl($routeName, $params));
    }
}
