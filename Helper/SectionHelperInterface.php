<?php
/**
 * File containing the SectionHelperInterface interface.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */

namespace EzSystems\PlatformUIBundle\Helper;

use eZ\Publish\API\Repository\Values\Content\Section;
use EzSystems\PlatformUIBundle\Entity\Section as SectionEntity;

/**
 * Interface SectionHelperInterface
 *
 * Provides utility methods to handle section stored in the API
 *
 * @package EzSystems\PlatformUIBundle\Helper
 */
interface SectionHelperInterface
{
    /**
     * Returns the section list
     *
     * @return \EzSystems\PlatformUIBundle\Entity\EnrichedSection[]
     */
    public function getSectionList();

    /**
     * Returns whether the current user can create a new section
     *
     * @return boolean
     */
    public function canCreate();

    /**
     * Returns a section
     *
     * @throws \eZ\Publish\API\Repository\Exceptions\NotFoundException if section could not be found
     * @throws \eZ\Publish\API\Repository\Exceptions\UnauthorizedException If the current user user is not allowed to read a section
     *
     * @param mixed $sectionId
     *
     * @return \eZ\Publish\API\Repository\Values\Content\Section
     */
    public function loadSection( $sectionId );

    /**
     * Returns the number of contents assigned to a given $section
     * @param \eZ\Publish\API\Repository\Values\Content\Section $section
     * @return int
     */
    public function contentCount( Section $section );

    /**
     * Creates a new Section in the content repository
     *
     * @throws \eZ\Publish\API\Repository\Exceptions\UnauthorizedException If the current user is
     *  not allowed to create a section
     * @throws \eZ\Publish\API\Repository\Exceptions\InvalidArgumentException If the new identifier
     *  already exists
     *
     * @param  \EzSystems\PlatformUIBundle\Entity\Section $section
     *
     * @return \eZ\Publish\API\Repository\Values\Content\Section The newly created section
     */
    public function createSection( SectionEntity $section );

    /**
     * Updates a Section in the content repository
     *
     * @throws \eZ\Publish\API\Repository\Exceptions\UnauthorizedException If the current user is
     *  not allowed to update a section
     * @throws \eZ\Publish\API\Repository\Exceptions\InvalidArgumentException If the new identifier
     *  already exists
     *
     * @param  \eZ\Publish\API\Repository\Values\Content\Section $sectionToUpdate
     * @param  \EzSystems\PlatformUIBundle\Entity\Section $section
     *
     * @return \eZ\Publish\API\Repository\Values\Content\Section The updated section
     */
    public function updateSection( Section $sectionToUpdate, SectionEntity $section );

}
