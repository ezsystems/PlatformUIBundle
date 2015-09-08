<?php
/**
 * This file is part of the eZ PlatformUI package.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 * @version //autogentag//
 */
namespace EzSystems\PlatformUIBundle\Http;

use Symfony\Component\HttpFoundation\Response;

/**
 * Specific redirect response, dedicated to PlatformUI JS app.
 */
class PjaxRedirectResponse extends Response
{
    public function __construct($url, array $headers = [])
    {
        parent::__construct('', self::HTTP_RESET_CONTENT, $headers + ['PJAX-Location' => $url]);
    }
}
