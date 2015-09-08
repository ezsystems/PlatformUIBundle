<?php
/**
 * This file is part of the eZ PlatformUI package.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 * @version //autogentag//
 */
namespace EzSystems\PlatformUIBundle\Controller;

use EzSystems\PlatformUIBundle\Http\PjaxRedirectResponse;
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
     * Returns a PJAX sepcific redirect response (HTTP 205 with PJAX-Location header).
     *
     * @param string $url
     *
     * @return PjaxRedirectResponse
     */
    protected function pjaxRedirect($url)
    {
        return new PjaxRedirectResponse($url);
    }

    /**
     * Returns a PJAX specific redirect response from $routeName.
     *
     * @param string $routeName
     * @param array $params Hash of parameters to generate the route.
     *
     * @return PjaxRedirectResponse
     */
    protected function pjaxRedirectToRoute($routeName, array $params = [])
    {
        return $this->pjaxRedirect($this->generateUrl($routeName, $params));
    }
}
