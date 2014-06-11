<?php
/**
 * File containing the SectionHelperInterface interface.
 *
 * @copyright Copyright (C) 1999-2014 eZ Systems AS. All rights reserved.
 * @license http://www.gnu.org/licenses/gpl-2.0.txt GNU General Public License v2
 * @version //autogentag//
 */

namespace EzSystems\PlatformUIBundle\Helper;

use eZ\Publish\API\Repository\Values\Content\Section;

interface SectionHelperInterface
{
    /**
     * Returns the section list as an array. Each element of the returned array
     * is an associated array containing the following entries:
     *      - section: the Section object
     *      - contentCount: the number of contents the section is assigned to
     *      - canEdit: whether the current user can edit the section
     *      - canDelete: whether the current user can delete the section
     *      - canAssign: whether the current user can assign the section to some contents
     *
     * @return array
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
     * @param int $sectionId
     * @return \eZ\Publish\API\Repository\Values\Content\Section
     */
    public function loadSection( $sectionId );

    /**
     * Returns the number of contents assigned to a given $section
     * @param \eZ\Publish\API\Repository\Values\Content\Section $section
     * @return int
     */
    public function contentCount( Section $section );
}
