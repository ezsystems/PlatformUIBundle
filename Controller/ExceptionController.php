<?php
/**
 * This file is part of the eZ PlatformUI package.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 * @version //autogentag//
 */
namespace EzSystems\PlatformUIBundle\Controller;

use Symfony\Bundle\TwigBundle\Controller\ExceptionController as BaseExceptionController;
use Symfony\Component\HttpFoundation\Request;

class ExceptionController extends BaseExceptionController
{
    protected function findTemplate(Request $request, $format, $code, $showException)
    {
        $template = parent::findTemplate($request, $format, $code, $showException);

        // Only customize error display for PJAX requests.
        if (!$request->headers->has('X-PJAX')) {
            return $template;
        }

        $customTemplate = clone $template;
        $customTemplate->set('bundle', 'eZPlatformUIBundle');
        if ($this->templateExists($customTemplate)) {
            return $customTemplate;
        }

        return $template;
    }
}
