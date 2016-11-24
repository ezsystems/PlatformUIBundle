<?php
/**
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle\EventListener;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\GetResponseEvent;
use Symfony\Component\HttpKernel\KernelEvents;

/**
 * On PJAX requests, sets the request's locale from the browser's accept-language header.
 */
class PjaxBrowserLanguageSubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents()
    {
        return [
            KernelEvents::REQUEST => [
                // priority needs to be higher than the CoreBundle's LocaleListener
                ['setPjaxRequestLocale', 50],
            ],
        ];
    }

    public function setPjaxRequestLocale(GetResponseEvent $event)
    {
        $request = $event->getRequest();

        if (!$event->isMasterRequest() || !$request->headers->has('x-pjax')) {
            return;
        }

        $request->setLocale($request->getPreferredLanguage());
        $request->attributes->set('_locale', $request->getPreferredLanguage());
    }
}
