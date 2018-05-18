<?php

/**
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle\Rest\Generator;

use eZ\Publish\Core\REST\Common\Output\Generator\Json as BaseJson;

class Json extends BaseJson
{
    protected function generateMediaType($name, $type)
    {
        return "application/vnd.ez.platformui.{$name}+{$type}";
    }
}
