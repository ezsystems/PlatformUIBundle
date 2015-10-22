<?php
/**
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle\Controller\Rest;

use eZ\Publish\API\Repository\Exceptions\NotFoundException;
use eZ\Publish\API\Repository\Values\Content\ContentCreateStruct;
use eZ\Publish\API\Repository\Values\User\UserUpdateStruct;
use eZ\Publish\Core\Repository\Values\User\UserCreateStruct;
use eZ\Publish\Core\REST\Server\Exceptions\BadRequestException;
use eZ\Publish\Core\REST\Server\Values\RestContent;
use eZ\Publish\Core\REST\Server\Values\Version;
use Symfony\Component\HttpFoundation\Request;
use eZ\Publish\Core\REST\Common\Message;
use eZ\Publish\Core\REST\Server\Controller\Content;
use eZ\Publish\Core\REST\Server\Values\CreatedContent;
use eZ\Publish\Core\REST\Server\Values\NoContent;
use eZ\Publish\API\Repository\Values\User\User;
use eZ\Publish\Core\FieldType\User\Value as UserFieldValue;

/**
 * Override of the REST Content Controller.
 *
 * Features:
 * - Proxies Content calls on User content to the UserService.
 */
class ContentController extends Content
{
    public function createContent(Request $request)
    {
        if (!$this->isUserCreateRequest($request)) {
            return parent::createContent($request);
        }

        $createdUser = $this->repository->getUserService()->createUser(
            $this->mapRequestToUserCreateStruct($request),
            $this->mapRequestToParentGroups($request)
        );

        return $this->mapUserToCreatedContent($createdUser);
    }

    public function deleteContent($contentId)
    {
        if (!$this->isUserContent($contentId)) {
            return parent::deleteContent($contentId);
        }

        $this->repository->getUserService()->deleteUser(
            $this->repository->getUserService()->loadUser($contentId)
        );

        return new NoContent();
    }

    /**
     * If the updated content is a user, update it using the user API, and return a Version object.
     *
     * @param mixed $contentId
     * @param int $versionNumber
     * @param \Symfony\Component\HttpFoundation\Request $request
     *
     * @return \eZ\Publish\Core\REST\Server\Values\Version
     */
    public function updateVersion($contentId, $versionNumber, Request $request)
    {
        if (!$this->isUserContent($contentId)) {
            return parent::updateVersion($contentId, $versionNumber, $request);
        }

        $updatedUser = $this->repository->getUserService()->updateUser(
            $this->repository->getUserService()->loadUser($contentId),
            $this->mapRequestToUserUpdateStruct($request)
        );

        return $this->mapUserToVersion($updatedUser, $request);
    }

    /**
     * If the published content is a user, return directly without publishing.
     *
     * @param mixed $contentId
     * @param int $versionNumber
     *
     * @return \eZ\Publish\Core\REST\Server\Values\NoContent
     */
    public function publishVersion($contentId, $versionNumber)
    {
        if (!$this->isUserContent($contentId)) {
            parent::publishVersion($contentId, $versionNumber);
        }

        return new NoContent();
    }

    private function isUserCreateRequest(Request $request)
    {
        if (($contentTypeHeaderValue = $request->headers->get('Content-Type')) == null) {
            return false;
        }

        list($mediaType) = explode('+', $contentTypeHeaderValue);
        if (strtolower($mediaType) !== 'application/vnd.ez.api.contentcreate') {
            return false;
        }

        $contentCreate = $this->inputDispatcher->parse(
            new Message(
                array(
                    'Content-Type' => $contentTypeHeaderValue,
                    'Url' => $request->getPathInfo(),
                ),
                $request->getContent()
            )
        );

        foreach ($contentCreate->contentCreateStruct->fields as $field) {
            if ($field->value instanceof UserFieldValue) {
                return true;
            }
        }

        return false;
    }

    /**
     * Checks if $contentId is an existing User content.
     *
     * @param mixed $contentId
     *
     * @return bool
     */
    private function isUserContent($contentId)
    {
        try {
            $this->repository->getUserService()->loadUser($contentId);

            return true;
        } catch (NotFoundException $e) {
            return false;
        }
    }

    /**
     * @return \eZ\Publish\API\Repository\Values\User\UserCreateStruct
     */
    private function mapRequestToUserCreateStruct(Request $request)
    {
        /** @var ContentCreateStruct $contentCreateStruct */
        $contentCreateStruct = $this->parseRequestContent($request)->contentCreateStruct;

        $userCreateStruct = new UserCreateStruct();
        foreach ($contentCreateStruct->fields as $field) {
            if ($field->value instanceof UserFieldValue) {
                //$userCreateStruct->login = $field->value->login;
                $userCreateStruct->email = $field->value->email;
                $userCreateStruct->password = $field->value->passwordHash;

                /** @var UserFieldValue $userFieldValue */
                $userFieldValue = clone $field->value;

                $field->value->passwordHash = null;
            }
            $userCreateStruct->fields[] = $field;
        }

        if (!isset($userFieldValue)) {
            throw new BadRequestException('No user field found in the ContentCreateStruct');
        }

        $properties = [
            'alwaysAvailable',
            'contentType',
            'mainLanguageCode',
            'modificationDate',
            'remoteId',
            'ownerId',
            'sectionId',
        ];
        foreach ($properties as $propertyName) {
            $userCreateStruct->$propertyName = $contentCreateStruct->$propertyName;
        }

        $userCreateStruct->login = $userFieldValue->login;
        $userCreateStruct->email = $userFieldValue->email;
        $userCreateStruct->password = $userFieldValue->passwordHash;

        return $userCreateStruct;
    }

    /**
     * @param \Symfony\Component\HttpFoundation\Request $request
     *
     * @return \eZ\Publish\API\Repository\Values\User\UserGroup[]
     */
    private function mapRequestToParentGroups(Request $request)
    {
        $groupId = $this->repository->getLocationService()->loadLocation(
            $this->parseRequestContent($request)->locationCreateStruct->parentLocationId
        )->contentId;
        $group = $this->repository->getUserService()->loadUserGroup($groupId);

        return [$group];
    }

    /**
     * @param User $user
     *
     * @return \eZ\Publish\Core\REST\Server\Values\CreatedContent
     */
    private function mapUserToCreatedContent(User $user)
    {
        return new CreatedContent([
            'content' => new RestContent(
                $user->contentInfo,
                $this->repository->getLocationService()->loadLocation($user->contentInfo->mainLocationId),
                $this->repository->getContentService()->loadContentByContentInfo($user->contentInfo),
                $this->repository->getContentTypeService()->loadContentType($user->contentInfo->contentTypeId),
                $this->repository->getContentService()->loadRelations($user->versionInfo)
            ),
        ]);
    }

    /**
     * @param \Symfony\Component\HttpFoundation\Request $request
     *
     * @return mixed
     */
    private function parseRequestContent(Request $request)
    {
        return $restContentCreateStruct = $this->inputDispatcher->parse(
            new Message(
                array('Content-Type' => $request->headers->get('Content-Type'), 'Url' => $request->getPathInfo()),
                $request->getContent()
            )
        );
    }

    /**
     * @param \Symfony\Component\HttpFoundation\Request $request
     *
     * @return \eZ\Publish\API\Repository\Values\User\UserUpdateStruct
     */
    private function mapRequestToUserUpdateStruct($request)
    {
        $contentUpdateStruct = $this->parseRequestContent($request);
        $userUpdateStruct = new UserUpdateStruct();
        foreach ($contentUpdateStruct->fields as $field) {
            if ($field->value instanceof UserFieldValue) {
                $userUpdateStruct->email = $field->value->email;
                $userUpdateStruct->password = $field->value->passwordHash;

                $field->value->passwordHash = null;
            }
        }

        $userUpdateStruct->contentUpdateStruct = $contentUpdateStruct;

        return $userUpdateStruct;
    }

    /**
     * @param \eZ\Publish\API\Repository\Values\User\User $user
     * @param \Symfony\Component\HttpFoundation\Request $request
     *
     * @return \eZ\Publish\Core\REST\Server\Values\Version
     */
    private function mapUserToVersion(User $user, Request $request)
    {
        $content = $this->repository->getContentService()->loadContent($user->id);
        $request->headers->set('Url', $request->getPathInfo());

        return new Version(
            $content,
            $this->repository->getContentTypeService()->loadContentType($content->contentInfo->contentTypeId),
            $this->repository->getContentService()->loadRelations($content->getVersionInfo()),
            $request->getPathInfo()
        );
    }
}
