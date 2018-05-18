<?php

/**
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle\Rest\ValueObjectVisitor;

use eZ\Publish\API\Repository\Exceptions\NotFoundException;
use eZ\Publish\API\Repository\Repository;
use eZ\Publish\Core\REST\Common\Output\Generator;
use eZ\Publish\Core\REST\Common\Output\Visitor;
use eZ\Publish\Core\REST\Server\Output\ValueObjectVisitor\VersionInfo as BaseVersionInfo;
use eZ\Publish\API\Repository\Values\Content\VersionInfo as APIVersionInfo;

/**
 * VersionInfo value object visitor.
 */
class VersionInfo extends BaseVersionInfo
{
    /** @var \eZ\Publish\API\Repository\Repository */
    private $repository;

    /**
     * VersionInfo constructor.
     *
     * @param \eZ\Publish\API\Repository\Repository $repository
     */
    public function __construct(Repository $repository)
    {
        $this->repository = $repository;
    }

    protected function visitVersionInfoAttributes(Visitor $visitor, Generator $generator, APIVersionInfo $versionInfo)
    {
        parent::visitVersionInfoAttributes($visitor, $generator, $versionInfo);

        $this->visitCreatorName($visitor, $generator, $versionInfo);
    }

    protected function visitCreatorName(Visitor $visitor, Generator $generator, APIVersionInfo $versionInfo)
    {
        /** @var \eZ\Publish\API\Repository\Values\User\User $user */
        $user = $this->repository->sudo(function (Repository $repository) use ($versionInfo) {
            try {
                return $repository->getUserService()->loadUser($versionInfo->creatorId);
            } catch (NotFoundException $e) {
                return null;
            }
        });

        $generator->startValueElement('creatorName', $user ? $user->getName() : '-');
        $generator->endValueElement('creatorName');
    }
}
