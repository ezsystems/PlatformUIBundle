<?php
/**
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle\Rest;

use eZ\Publish\API\Repository\Repository;
use eZ\Publish\Core\Repository\Values\User\UserCreateStruct;
use eZ\Publish\Core\REST\Common\Input\Dispatcher;
use eZ\Publish\Core\REST\Common\Message;
use eZ\Publish\Core\REST\Server\Values\CreatedContent;
use eZ\Publish\Core\REST\Server\Values\RestContent;
use eZ\Publish\Core\REST\Server\Values\RestContentCreateStruct;
use eZ\Publish\Core\REST\Server\View\AcceptHeaderVisitorDispatcher;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Event\GetResponseEvent;
use Symfony\Component\HttpKernel\KernelEvents;
use eZ\Publish\Core\FieldType\User\Value as UserFieldValue;

class ContentUserGateway implements EventSubscriberInterface
{
    /** @var \eZ\Publish\Core\REST\Common\Input\Dispatcher */
    private $restInputDispatcher;

    /** @var \eZ\Publish\API\Repository\Repository */
    private $repository;

    /** @var \eZ\Publish\Core\REST\Server\View\AcceptHeaderVisitorDispatcher */
    private $viewDispatcher;

    public function __construct(Dispatcher $restInputDispatcher, AcceptHeaderVisitorDispatcher $viewDispatcher, Repository $repository)
    {
        $this->restInputDispatcher = $restInputDispatcher;
        $this->repository = $repository;
        $this->viewDispatcher = $viewDispatcher;
    }

    public static function getSubscribedEvents()
    {
        return [KernelEvents::REQUEST => ['onKernelRequest', -1000]];
    }

    public function onKernelRequest(GetResponseEvent $event)
    {
        $request = $event->getRequest();
        if (!$request->attributes->get('is_rest_request')) {
            return;
        }

        if (($contentTypeHeaderValue = $request->headers->get('content-type')) === null) {
            return;
        }

        list($mediaType) = explode('+', $contentTypeHeaderValue);
        if (strtolower($mediaType) !== 'application/vnd.ez.api.contentcreate') {
            return;
        }

        $message = $this->buildMessage($request);
        if (!$message->body) {
            return;
        }
        $result = $this->restInputDispatcher->parse($message);
        if (!$result instanceof RestContentCreateStruct) {
            return;
        }

        // Not a user
        if (($userCreateData = $this->mapContentCreateToUserCreate($result)) === false) {
            return;
        }

        list($userCreateStruct, $userGroup) = $userCreateData;
        $createdUser = $this->repository->getUserService()->createUser($userCreateStruct, [$userGroup]);
        $createdContentInfo = $createdUser->contentInfo;
        $createdLocation = $this->repository->getLocationService()->loadLocation($createdContentInfo->mainLocationId);
        $contentType = $this->repository->getContentTypeService()->loadContentType($createdContentInfo->contentTypeId);

        $result = new CreatedContent(
            array(
                'content' => new RestContent(
                    $createdContentInfo,
                    $createdLocation,
                    $this->repository->getContentService()->loadContent($createdContentInfo->id),
                    $contentType,
                    $this->repository->getContentService()->loadRelations($createdUser->getVersionInfo())
                ),
            )
        );

        $event->setResponse($this->viewDispatcher->dispatch($event->getRequest(), $result));
    }

    /**
     * @param \Symfony\Component\HttpFoundation\Request $request
     *
     * @return \eZ\Publish\Core\REST\Common\Message
     */
    private function buildMessage(Request $request)
    {
        $requestHeaders = $request->headers->all();
        $headers = [];
        foreach ($requestHeaders as $headerName => $headerValue) {
            $headers[$this->fixHeaderCase($headerName)] = implode('; ', $headerValue);
        }
        $headers['Url'] = $request->getPathInfo();

        return new Message($headers, $request->getContent());
    }

    private function fixHeaderCase($headerName)
    {
        $caseMap = ['content-type' => 'Content-Type'];

        return isset($caseMap[$headerName]) ? $caseMap[$headerName] : $headerName;
    }

    private function mapContentCreateToUserCreate(RestContentCreateStruct $restContentCreateStruct)
    {
        $contentCreateStruct = $restContentCreateStruct->contentCreateStruct;

        $userCreateStruct = new UserCreateStruct();
        $fields = array();
        foreach ($contentCreateStruct->fields as $field) {
            // @todo fix hardcode user_account
            if ($field->value instanceof UserFieldValue) {
                $userCreateStruct->login = $field->value->login;
                $userCreateStruct->email = $field->value->email;
                $userCreateStruct->password = $field->value->passwordHash;

                $field->value->passwordHash = null;

                $foundUserField = true;
            }
            $userCreateStruct->fields[] = $field;
        }

        if (!isset($foundUserField)) {
            return false;
        }

        $properties = ['contentType', 'sectionId', 'ownerId', 'alwaysAvailable', 'remoteId', 'mainLanguageCode', 'modificationDate'];
        foreach ($properties as $property) {
            if (isset($contentCreateStruct->$property)) {
                $userCreateStruct->$property = $contentCreateStruct->$property;
            }
        }

        $userGroup = $this->repository->getUserService()->loadUserGroup(
            $restContentCreateStruct->locationCreateStruct->parentLocationId
        );

        return [$userCreateStruct, $userGroup];
    }
}
