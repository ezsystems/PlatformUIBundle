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
        return $request->headers->has('x-pjax');
    }
}
