<?php

/**
 * This file is part of the eZ PlatformUI package.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 *
 * @version //autogentag//
 */
namespace EzSystems\PlatformUIBundle\Tests\Notification;

use EzSystems\PlatformUIBundle\Notification\Notification;
use EzSystems\PlatformUIBundle\Notification\NotificationMessage;
use EzSystems\PlatformUIBundle\Notification\NotificationPool;
use EzSystems\PlatformUIBundle\Notification\TranslatableNotificationMessage;
use PHPUnit_Framework_TestCase;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\FilterResponseEvent;
use Symfony\Component\HttpKernel\HttpKernelInterface;
use Symfony\Component\HttpKernel\KernelEvents;

class NotificationPoolTest extends PHPUnit_Framework_TestCase
{
    /**
     * @var \PHPUnit_Framework_MockObject_MockObject
     */
    private $translator;

    /**
     * @var \PHPUnit_Framework_MockObject_MockObject
     */
    private $session;

    /**
     * @var NotificationPool
     */
    private $pool;

    protected function setUp()
    {
        parent::setUp();
        $this->translator = $this->getMock('\Symfony\Component\Translation\TranslatorInterface');
        $this->session = $this->getMock('\Symfony\Component\HttpFoundation\Session\Session');

        $this->pool = new NotificationPool($this->translator, $this->session);
    }

    public function testGetSubscribedEvents()
    {
        self::assertSame(
            [KernelEvents::RESPONSE => 'onKernelResponse'],
            NotificationPool::getSubscribedEvents()
        );
    }

    public function testAddNotificationsWithoutTranslation()
    {
        $message1 = 'foo1';
        $state1 = Notification::STATE_DONE;
        $this->pool->addNotification(new NotificationMessage(['message' => $message1]), $state1);

        $message2 = 'foo2';
        $state2 = Notification::STATE_ERROR;
        $this->pool->addNotification(new NotificationMessage(['message' => $message2]), $state2);

        $message3 = 'foo3';
        $state3 = Notification::STATE_STARTED;
        $this->pool->addNotification(new NotificationMessage(['message' => $message3]), $state3);

        $message4 = 'foo4';
        $state4 = 'some_random_state';
        $this->pool->addNotification(new NotificationMessage(['message' => $message4]), $state4);

        $expected = [
            new Notification(['message' => $message1, 'state' => $state1]),
            new Notification(['message' => $message2, 'state' => $state2]),
            new Notification(['message' => $message3, 'state' => $state3]),
            new Notification(['message' => $message4, 'state' => $state4]),
        ];
        self::assertEquals($expected, $this->pool->getNotifications());
    }

    public function testAddNotificationSimpleTranslation()
    {
        $message = 'foo';
        $params = ['some' => 'thing'];
        $domain = 'my_domain';
        $state = Notification::STATE_ERROR;
        $translation = 'bar';

        $this->translator
            ->expects($this->never())
            ->method('transChoice');
        $this->translator
            ->expects($this->once())
            ->method('trans')
            ->with($message, $params, $domain)
            ->willReturn($translation);
        $this->pool->addNotification(
            new TranslatableNotificationMessage([
                'message' => $message,
                'translationParams' => $params,
                'domain' => $domain,
            ]),
            $state
        );

        $expected = [new Notification(['message' => $translation, 'state' => $state])];
        self::assertEquals($expected, $this->pool->getNotifications());
    }

    public function testAddNotificationTransChoice()
    {
        $message = 'foo';
        $params = ['some' => 'thing'];
        $domain = 'my_domain';
        $number = 4;
        $state = Notification::STATE_ERROR;
        $translation = 'bar';

        $this->translator
            ->expects($this->never())
            ->method('trans');
        $this->translator
            ->expects($this->once())
            ->method('transChoice')
            ->with($message, $number, $params, $domain)
            ->willReturn($translation);
        $this->pool->addNotification(
            new TranslatableNotificationMessage([
                'message' => $message,
                'translationParams' => $params,
                'domain' => $domain,
                'number' => $number,
            ]),
            $state
        );

        $expected = [new Notification(['message' => $translation, 'state' => $state])];
        self::assertEquals($expected, $this->pool->getNotifications());
    }

    public function testOnKernelResponse()
    {
        $flashBag = $this->getMock('\Symfony\Component\HttpFoundation\Session\Flash\FlashBagInterface');
        $this->session
            ->expects($this->once())
            ->method('getFlashBag')
            ->willReturn($flashBag);

        $message1 = 'foo1';
        $state1 = Notification::STATE_DONE;
        $this->pool->addNotification(new NotificationMessage(['message' => $message1]), $state1);

        $message2 = 'foo2';
        $state2 = Notification::STATE_ERROR;
        $this->pool->addNotification(new NotificationMessage(['message' => $message2]), $state2);

        $message3 = 'foo3';
        $state3 = Notification::STATE_STARTED;
        $this->pool->addNotification(new NotificationMessage(['message' => $message3]), $state3);

        $message4 = 'foo4';
        $state4 = 'some_random_state';
        $this->pool->addNotification(new NotificationMessage(['message' => $message4]), $state4);

        $notifications = [
            new Notification(['message' => $message1, 'state' => $state1]),
            new Notification(['message' => $message2, 'state' => $state2]),
            new Notification(['message' => $message3, 'state' => $state3]),
            new Notification(['message' => $message4, 'state' => $state4]),
        ];

        $flashBag
            ->expects($this->once())
            ->method('set')
            ->with('notification', $notifications);

        $this->pool->onKernelResponse(
            new FilterResponseEvent(
                $this->getMock('\Symfony\Component\HttpKernel\HttpKernelInterface'),
                new Request(),
                HttpKernelInterface::MASTER_REQUEST,
                new Response()
            )
        );
    }
}
