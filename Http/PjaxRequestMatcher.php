<?php
/**
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle\Http;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestMatcherInterface;

/**
 * Matches a PlatformUI PJAX request.
 */
final class PjaxRequestMatcher implements RequestMatcherInterface
{
    public function matches(Request $request)
    {
        return $this->hasPjaxHeader($request)
            || $this->hasPjaxInRequestUri($request);
    }

    /**
     * @param \Symfony\Component\HttpFoundation\Request $request
     *
     * @return bool
     */
    private function hasPjaxHeader(Request $request)
    {
        return $request->headers->has('x-pjax');
    }

    /**
     * @param \Symfony\Component\HttpFoundation\Request $request
     *
     * @return bool
     */
    private function hasPjaxInRequestUri(Request $request)
    {
        return strpos($request->getRequestUri(), '/pjax') !== false;
    }
}
