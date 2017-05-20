<?php
/**
 * This file is part of the eZ PlatformUI package.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 * @version //autogentag//
 */
namespace EzSystems\PlatformUIBundle\Controller;

use EzSystems\PlatformUIBundle\Notification\NotificationPoolAware;
use eZ\Bundle\EzPublishCoreBundle\Controller as BaseController;
use Symfony\Component\HttpFoundation\RedirectResponse;

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
     * Returns a redirect response to $url. Use this method after form processing.
     * Kept for backward compatibility.
     *
     * @param string $url
     *
     * @return RedirectResponse
     */
    protected function redirectAfterFormPost($url)
    {
        return new RedirectResponse($url);
    }

    /**
     * Performs a redirect to $routeName.
     * Use this method after form processing.
     *
     * @param string $routeName
     * @param array $params Hash of parameters to generate the route.
     *
     * @return RedirectResponse
     */
    protected function redirectToRouteAfterFormPost($routeName, array $params = [])
    {
        return $this->redirectAfterFormPost($this->generateUrl($routeName, $params));
    }
}
