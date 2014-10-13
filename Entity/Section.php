<?php
/**
 * File containing the Section class.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 * @version //autogentag//
 */

namespace EzSystems\PlatformUIBundle\Entity;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * Class Section
 *
 * Section Entity to use with Symfony's form component
 *
 * @package EzSystems\PlatformUIBundle\Entity
 */
class Section
{
    /**
     * @Assert\NotBlank( message ="section.validator.identifier.not_blank" )
     * @Assert\Regex(
     *    pattern="/(^[^A-Za-z])|\W/",
     *    match=false,
     *    message="section.validator.identifier.format"
     * )
     */
    public $identifier;

    /**
     * @Assert\NotBlank( message ="section.validator.name.not_blank" )
     */
    public $name;
}
