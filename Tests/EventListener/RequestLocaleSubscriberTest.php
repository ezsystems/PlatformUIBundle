<?php
/**
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle\Tests\EventListener;

use EzSystems\PlatformUIBundle\EventListener\RequestLocaleSubscriber;
use PHPUnit_Framework_TestCase;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Event\GetResponseEvent;
use Symfony\Component\HttpKernel\HttpKernelInterface;

final class RequestLocaleSubscriberTest extends PHPUnit_Framework_TestCase
{
    private $subscriber;

    public function setUp()
    {
        $this->subscriber = new RequestLocaleSubscriber(
            $this->getRequestMatcherMock()
        );
    }

    public function testSetPjaxRequestLocaleSubRequest()
    {
        $request = new Request();
        $request->headers->set('Accept-language', 'fr-fr; q=0.8, en; q=0.6');
        $event = $this->createEvent($request, HttpKernelInterface::SUB_REQUEST);

        $this->subscriber->setPjaxRequestLocale($event);

        $this->assertEquals('en', $request->getLocale());
        $this->assertFalse($request->attributes->has('_locale'));
    }

    public function testSetPjaxRequestLocale()
    {
        $request = new Request();
        $request->headers->set('Accept-language', 'fr-fr; q=0.8, en; q=0.6');
        $event = $this->createEvent($request);

        $this->getRequestMatcherMock()->method('matches')->willReturn(true);

        $this->subscriber->setPjaxRequestLocale($event);

        $this->assertEquals('fr_FR', $request->getLocale());
        $this->assertEquals('fr_FR', $request->attributes->get('_locale'));
    }

    /**
     * @param $request
     * @param int $requestType
     * @return GetResponseEvent
     */
    private function createEvent($request, $requestType = HttpKernelInterface::MASTER_REQUEST)
    {
        return new GetResponseEvent(
            $this->getMock('Symfony\Component\HttpKernel\HttpKernelInterface'),
            $request,
            $requestType
        );
    }

    private function getRequestMatcherMock()
    {
        static $mock;

        if (!isset($mock)) {
            $mock = $this->getMock('Symfony\Component\HttpFoundation\RequestMatcherInterface');
        }

        return $mock;
    }
}
