<?php
/**
 * File containing the SectionListItem class.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 * @version //autogentag//
 */

namespace EzSystems\PlatformUIBundle\Entity;

use eZ\Publish\API\Repository\Values\Content\Section as ApiSection;

/**
 * Class SectionListItem
 *
 * This class is a container for a Section and extra information
 *
 * @package EzSystems\PlatformUIBundle\Entity
 *
 */
class SectionListItem extends Section
{
    /**
     * @var int
     */
    public $id;

    /**
     * @var int
     */
    public $contentCount;

    /**
     * @var bool
     */
    public $canEdit;

    /**
     * @var bool
     */
    public $canDelete;

    /**
     * @var bool
     */
    public $canAssign;

    /**
     * @param \eZ\Publish\API\Repository\Values\Content\Section $section
     * @param int $contentCount
     * @param bool $canEdit
     * @param bool $canDelete
     * @param bool $canAssign
     */
    public function __construct(ApiSection $section, $contentCount, $canEdit, $canDelete, $canAssign)
    {
        $this->id = $section->id;
        $this->name = $section->name;
        $this->identifier = $section->identifier;
        $this->contentCount = $contentCount;
        $this->canEdit = $canEdit;
        $this->canDelete = $canDelete;
        $this->canAssign = $canAssign;
    }
}
