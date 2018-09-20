<?php

/**
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle\Tests\Rest\Generator;

use eZ\Publish\Core\REST\Common\Output\Generator\Json\FieldTypeHashGenerator;
use eZ\Publish\Core\REST\Common\Output\Generator\Json;
use PHPUnit\Framework\TestCase;

class JsonTest extends TestCase
{
    public function testGetMediaType()
    {
        $vendor = 'vnd.ez.platformui';
        $mediaType = (new Json($this->getMock(FieldTypeHashGenerator::class), $vendor))->getMediaType('Object');

        $this->assertEquals('application/vnd.ez.platformui.Object+json', $mediaType);
    }
}
