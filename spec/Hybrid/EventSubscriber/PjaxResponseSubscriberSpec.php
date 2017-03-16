<?php

namespace spec\EzSystems\PlatformUIBundle\Hybrid\EventSubscriber;

use EzSystems\PlatformUIBundle\Hybrid\EventSubscriber\AppRenderer;
use EzSystems\PlatformUIBundle\Hybrid\EventSubscriber\PjaxResponseSubscriber;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestMatcherInterface;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\FilterResponseEvent;
use Symfony\Component\HttpKernel\KernelEvents;

/**
 * @method array getSubscribedEvents()
 * @method mapPjaxResponseToHybridResponse(FilterResponseEvent $event)
 */
class PjaxResponseSubscriberSpec extends ObjectBehavior
{
    function let(
        FilterResponseEvent $event,
        Request $request,
        Response $response,
        RequestMatcherInterface $adminRequestMatcher,
        RequestMatcherInterface $pjaxRequestMatcher
    ) {
        $adminRequestMatcher->matches(Argument::type(Request::class))->willReturn(true);
        $pjaxRequestMatcher->matches(Argument::type(Request::class))->willReturn(true);
        $event->getRequest()->willReturn($request);
        $event->getResponse()->willReturn($response);

        $this->beConstructedWith($adminRequestMatcher, $pjaxRequestMatcher);
    }

    function it_is_initializable()
    {
        $this->shouldHaveType(PjaxResponseSubscriber::class);
        $this->shouldHaveType(EventSubscriberInterface::class);
    }

    function it_subscribes_to_the_response_KernelEvent()
    {
        $this->getSubscribedEvents()->shouldBeArray();
        $this->getSubscribedEvents()->shouldSubscribeToEvent(KernelEvents::RESPONSE);
    }

    function it_has_a_higher_priority_than_the_AppRenderer() {
        $this->getSubscribedEvents()->shouldHaveHigherPriorityThan(AppRenderer::class);
    }

    function it_skips_non_admin_requests(
        FilterResponseEvent $event,
        Request $request,
        RequestMatcherInterface $adminRequestMatcher
    ) {
        $adminRequestMatcher->matches($request)->willReturn(false);
        $this->mapPjaxResponseToHybridResponse($event);
        $event->getResponse()->shouldNotHaveBeenCalled();
    }

    function it_skips_non_pjax_requests(
        FilterResponseEvent $event,
        Request $request,
        RequestMatcherInterface $pjaxRequestMatcher
    ) {
        $pjaxRequestMatcher->matches($request)->willReturn(false);
        $this->mapPjaxResponseToHybridResponse($event);
        $event->getResponse()->shouldNotHaveBeenCalled();
    }

    function it_builds_a_HybridUiView_from_the_pjax_response_content(
        FilterResponseEvent $event
    ) {
        $this->mapPjaxResponseTohybridResponse($event);

        $event->setResponse(Argument::type(Response::class))->shouldHaveBeenCalled();
    }

    public function getMatchers()
    {
        return [
            'subscribeToEvent' => function (array $subscribedEvents, $event) {
                return isset($subscribedEvents[$event])
                    && is_array($subscribedEvents[$event]);
            },
            'haveHigherPriorityThan' => function (array $subscribedEvents, $otherSubscriberClass) {
                return $subscribedEvents[KernelEvents::RESPONSE][1] > $this->getFirstSubscriberPriority($otherSubscriberClass);
            },
            'haveLowerPriorityThan' => function (array $subscribedEvents, $otherSubscriberClass) {
                return $subscribedEvents[KernelEvents::RESPONSE][1] < $this->getFirstSubscriberPriority($otherSubscriberClass);
            }
        ];
    }

    /**
     * Returns the priority of the first subscriber of KernelEvents::RESPONSE.
     *
     * @param string $subscriberClass
     *
     * @return int
     */
    private function getFirstSubscriberPriority($subscriberClass)
    {
        if (!in_array(EventSubscriberInterface::class, class_implements($subscriberClass))) {
            throw new \Exception("Comparison class isn't an EventSubscriber");
        }
        $subscribedEvents = $subscriberClass::getSubscribedEvents();
        if (!isset($subscribedEvents[KernelEvents::RESPONSE])) {
            throw new \Exception("Comparison class doesn't subscribe to KernelEvents::RESPONSE");
        }
        $event = $subscribedEvents[KernelEvents::RESPONSE][0];

        return isset($event[1]) ? $event[1] : 0;
    }
}
