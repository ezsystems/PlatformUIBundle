<?php
/**
 * File containing the EnrichedSection class.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 * @version //autogentag//
 */

namespace EzSystems\PlatformUIBundle\Entity;

use eZ\Publish\API\Repository\Values\Content\Section;

/**
 * Class EnrichedSection
 *
 * This class is a container for a Section and extra information
 *
 * @package EzSystems\PlatformUIBundle\Entity
 */
class EnrichedSection
{
    /**
     * @var \eZ\Publish\API\Repository\Values\Content\Section
     */
    public $section;

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
    public function __construct( Section $section, $contentCount, $canEdit, $canDelete, $canAssign )
    {
        $this->section = $section;
        $this->contentCount = $contentCount;
        $this->canEdit = $canEdit;
        $this->canDelete = $canDelete;
        $this->canAssign = $canAssign;
    }
}
