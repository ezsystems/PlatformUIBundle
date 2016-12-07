<?php
/**
 * This file is part of the eZ PlatformUI package.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle\Matcher;

use eZ\Publish\Core\MVC\Symfony\Matcher\ViewMatcherInterface;
use eZ\Publish\Core\MVC\Symfony\RequestStackAware;
use eZ\Publish\Core\MVC\Symfony\View\View;
use EzSystems\PlatformUIBundle\Http\PjaxRequestMatcher;

/**
 * Matches views for a PlatformUI PJAX request.
 */
class PjaxRequest implements ViewMatcherInterface
{
    use RequestStackAware;

    /**
     * @var \EzSystems\PlatformUIBundle\Http\PjaxRequestMatcher
     */
    protected $pjaxRequestMatcher;

    /**
     * @param \EzSystems\PlatformUIBundle\Http\PjaxRequestMatcher $pjaxRequestMatcher
     */
    public function setPjaxRequestMatcher(PjaxRequestMatcher $pjaxRequestMatcher)
    {
        $this->pjaxRequestMatcher = $pjaxRequestMatcher;
    }

    public function setMatchingConfig($matchingConfig)
    {
    }

    public function match(View $view)
    {
        return $this->pjaxRequestMatcher->matches($this->requestStack->getMasterRequest());
    }
}
