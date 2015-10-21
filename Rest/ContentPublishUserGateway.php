<?php
/**
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle\Rest;

use eZ\Publish\API\Repository\Repository;
use eZ\Publish\Core\REST\Common\Input\Dispatcher;
use eZ\Publish\Core\REST\Server\Values\NoContent;
use eZ\Publish\Core\REST\Server\View\AcceptHeaderVisitorDispatcher;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Event\GetResponseEvent;
use Symfony\Component\HttpKernel\KernelEvents;

class ContentPublishUserGateway implements EventSubscriberInterface
{
    /** @var \eZ\Publish\Core\REST\Common\Input\Dispatcher */
    private $restInputDispatcher;

    /** @var \eZ\Publish\API\Repository\Repository */
    private $repository;

    /** @var \eZ\Publish\Core\REST\Server\View\AcceptHeaderVisitorDispatcher */
    private $viewDispatcher;

    public function __construct(
        Dispatcher $restInputDispatcher,
        AcceptHeaderVisitorDispatcher $viewDispatcher,
        Repository $repository,
        array $settings = []
    ) {
        $this->restInputDispatcher = $restInputDispatcher;
        $this->repository = $repository;
        $this->viewDispatcher = $viewDispatcher;
        $this->settings = $settings + ['user-content-type-id' => 4];
    }

    public static function getSubscribedEvents()
    {
        return [KernelEvents::REQUEST => ['onKernelRequest', -1000]];
    }

    public function onKernelRequest(GetResponseEvent $event)
    {
        if (!$this->shouldRun($request = $event->getRequest())) {
            return;
        }

        $event->setResponse($this->viewDispatcher->dispatch($event->getRequest(), new NoContent()));
    }

    private function shouldRun(Request $request)
    {
        if (!$request->attributes->get('is_rest_request')) {
            return false;
        }

        if ($request->attributes->get('_route') !== 'ezpublish_rest_publishVersion') {
            return false;
        }

        $method = $request->getMethod();
        $methodOverride = strtolower($request->headers->get('x-http-method-override'));
        if (strtolower($method) !== 'publish' || ($method === 'post' && $methodOverride !== 'publish')) {
            return false;
        }

        return ($this->loadContent($request)->contentInfo->contentTypeId === $this->settings['user-content-type-id']);
    }

    public function loadContent(Request $request)
    {
        static $content = null;

        if ($content === null) {
            $routeParams = $request->attributes->get('_route_params');
            $content = $this->repository->getContentService()->loadContent(
                $routeParams['contentId'],
                null,
                $routeParams['versionNumber']
            );
        }

        return $content;
    }
}
