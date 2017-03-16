<?php

namespace spec\EzSystems\PlatformUIBundle\Hybrid\EventSubscriber;

use eZ\Publish\Core\MVC\Symfony\View\View;
use EzSystems\PlatformUIBundle\Hybrid\EventSubscriber\AppRenderer;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\ParameterBag;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestMatcherInterface;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\FilterResponseEvent;
use Symfony\Component\HttpKernel\HttpKernelInterface;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\HttpKernel\KernelInterface;
use Symfony\Component\Templating\EngineInterface;

/**
 * @method array getSubscribedEvents()
 * @method renderApp()
 */
class AppRendererSpec extends ObjectBehavior
{
    function let(
        EngineInterface $templateEngine,
        FilterResponseEvent $event,
        KernelInterface $kernel,
        Request $request,
        Response $response,
        ParameterBag $requestAttributes,
        RequestMatcherInterface $adminRequestMatcher
    ) {
        $adminRequestMatcher->matches(Argument::type(Request::class))->willReturn(true);
        $request->attributes = $requestAttributes;
        $request->duplicate(Argument::cetera())->willReturn(new Request());

        $event->getRequest()->willReturn($request);
        $event->getRequestType()->willReturn(HttpKernelInterface::MASTER_REQUEST);
        $event->getResponse()->willReturn($response);

        $this->beConstructedWith($templateEngine, $kernel, $adminRequestMatcher);
    }

    function it_is_initializable()
    {
        $this->shouldHaveType(AppRenderer::class);
        $this->shouldHaveType(EventSubscriberInterface::class);
    }

    function it_subscribes_to_the_response_KernelEvent()
    {
        $this->getSubscribedEvents()->shouldBeArray();
        $this->getSubscribedEvents()->shouldSubscribeToEvent(KernelEvents::RESPONSE);
    }

    function it_ignores_sub_requests(
        FilterResponseEvent $event
    ) {
        $event->getRequestType()->willReturn(HttpKernelInterface::SUB_REQUEST);
        $event->getRequest()->shouldNotBeCalled();
        $this->renderApp($event);
    }

    function it_ignores_requests_without_a_view_attribute(
        FilterResponseEvent $event,
        ParameterBag $requestAttributes
    ) {
        $requestAttributes->get('view')->willReturn(false);
        $event->setResponse(Argument::any())->shouldNotBeCalled();

        $this->renderApp($event);
    }

    function it_ignores_requests_without_a_view_attribute_of_an_unknown_type(
        FilterResponseEvent $event,
        ParameterBag $requestAttributes
    ) {
        $requestAttributes->get('view')->willReturn(new \stdClass());
        $event->setResponse(Argument::any())->shouldNotBeCalled();

        $this->renderApp($event);
    }

    function it_renders_the_app(
        View $view,
        EngineInterface $templateEngine,
        FilterResponseEvent $event,
        ParameterBag $requestAttributes,
        Request $request,
        KernelInterface $kernel
    ) {
        $requestAttributes->get('view')->willReturn($view);
        $kernel->handle(Argument::cetera())->willReturn(new Response());
        $templateEngine->render(Argument::cetera())->willReturn('the app');
        $event->setResponse(Argument::type(Response::class))->shouldBeCalled();

        $this->renderApp($event);

    }

    public function getMatchers()
    {
        return [
            'subscribeToEvent' => function (array $subscribedEvents, $event) {
                return isset($subscribedEvents[$event])
                    && is_array($subscribedEvents[$event])
                    && count($subscribedEvents[$event]) === 1;
            },
            'havePriorityHigherThan' => function (array $subscribedEvents, $priority) {
                $event = $subscribedEvents[KernelEvents::VIEW][0];
                return isset($event[1]) && $event[1] > $priority;
            },
            'havePriorityLowerThan' => function (array $subscribedEvents, $priority) {
                $event = $subscribedEvents[KernelEvents::VIEW][0];
                return isset($event[1]) && $event[1] < $priority;
            }
        ];
    }
}
