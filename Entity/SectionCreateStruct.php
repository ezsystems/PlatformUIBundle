<?php
/**
 * File containing the SectionType class.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 * @version //autogentag//
 */

namespace EzSystems\PlatformUIBundle\Entity;

use eZ\Publish\API\Repository\Values\Content\SectionCreateStruct as APISectionCreateStruct;

class SectionCreateStruct extends APISectionCreateStruct
{
        public $name;
        public $identifier;
}
