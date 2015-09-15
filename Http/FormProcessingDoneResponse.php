<?php
/**
 * This file is part of the eZ PlatformUI package.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 * @version //autogentag//
 */
namespace EzSystems\PlatformUIBundle\Http;

use Symfony\Component\HttpFoundation\RedirectResponse;

/**
 * FormProcessingDoneResponse represents an HTTP response expected by eZ PlatformUI JS app
 * when a form has been posted and processed.
 * Result is an HTTP 205 response containing `PJAX-Location` header.
 * The JS app will then perform a redirection to the value of this header.
 */
class FormProcessingDoneResponse extends RedirectResponse
{
    public function __construct($url, array $headers = [])
    {
        parent::__construct($url, self::HTTP_RESET_CONTENT, $headers);
    }

    public function setTargetUrl($url)
    {
        $this->headers->set('PJAX-Location', $url);

        return $this;
    }

    public function isRedirect($location = null)
    {
        return true;
    }
}
