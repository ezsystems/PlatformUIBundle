<?php
/**
 * File containing the SectionHelper class.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */

namespace EzSystems\PlatformUIBundle\Helper;

use eZ\Publish\API\Repository\SectionService;
use eZ\Publish\Core\MVC\Symfony\Security\Authorization\Attribute as AuthorizationAttribute;
use EzSystems\PlatformUIBundle\Entity\EnrichedSection;
use Symfony\Component\Security\Core\SecurityContextInterface;
use eZ\Publish\API\Repository\Values\Content\Section;
use EzSystems\PlatformUIBundle\Entity\Section as SectionEntity;

class SectionHelper implements SectionHelperInterface
{
    /**
     * @var \eZ\Publish\API\Repository\SectionService
     */
    protected $sectionService;

    /**
     * @var \Symfony\Component\Security\Core\SecurityContextInterface
     */
    protected $securityContext;

    public function __construct(
        SectionService $sectionService, SecurityContextInterface $securityContext
    )
    {
        $this->sectionService = $sectionService;
        $this->securityContext = $securityContext;
    }

    /**
     * {@inheritDoc}
     */
    public function getSectionList()
    {
        $sections = $this->sectionService->loadSections();
        $list = array();
        foreach ( $sections as $section )
        {
            $list[] = new EnrichedSection(
                $section,
                $this->sectionService->countAssignedContents( $section ),
                $this->canUser( 'edit' ),
                $this->canUser( 'edit' ),
                $this->canUser( 'assign' )
            );
        }

        return $list;
    }

    /**
     * {@inheritDoc}
     */
    public function canCreate()
    {
        return $this->canUser( 'edit' );
    }

    /**
     * Checks whether the current user has access to the given $function in the
     * section module.
     *
     * @param string $function
     * @return boolean
     */
    protected function canUser( $function )
    {
        return $this->securityContext->isGranted(
            new AuthorizationAttribute(
                'section',
                $function
            )
        );
    }

    /**
     * {@inheritDoc}
     */
    public function loadSection( $sectionId )
    {
        return $this->sectionService->loadSection( $sectionId );
    }

    /**
     * {@inheritDoc}
     */
    public function contentCount( Section $section )
    {
        return $this->sectionService->countAssignedContents( $section );
    }

    /**
     * {@inheritDoc}
     */
    public function createSection( SectionEntity $section )
    {
        $sectionCreateStruct = $this->sectionService->newSectionCreateStruct();
        $sectionCreateStruct->identifier = $section->identifier;
        $sectionCreateStruct->name = $section->name;

        return $this->sectionService->createSection( $sectionCreateStruct );
    }

    /**
     * {@inheritDoc}
     */
    public function updateSection( Section $sectionToUpdate, SectionEntity $section)
    {
        $sectionUpdateStruct = $this->sectionService->newSectionUpdateStruct();
        $sectionUpdateStruct->identifier = $section->identifier;
        $sectionUpdateStruct->name = $section->name;

        return $this->sectionService->updateSection( $sectionToUpdate, $sectionUpdateStruct );
    }
}
