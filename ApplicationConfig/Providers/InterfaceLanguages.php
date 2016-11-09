<?php
/**
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle\ApplicationConfig\Providers;

use EzSystems\PlatformUIBundle\ApplicationConfig\Provider;
use Symfony\Component\HttpFoundation\RequestStack;

/**
 * Provides the languages to use to translate the UI. It uses the languages
 * configured in the browser and the configured fallback.
 */
class InterfaceLanguages implements Provider
{
    /** @var \Symfony\Component\HttpFoundation\RequestStack */
    private $requestStack;

    public function __construct(RequestStack $requestStack)
    {
        $this->requestStack = $requestStack;
    }

    public function getConfig()
    {
        $request = $this->requestStack->getMasterRequest();
        $browserLanguages = $request->getLanguages();
        $defaultLocale = $request->getDefaultLocale();

        if (!in_array($defaultLocale, $browserLanguages)) {
            $browserLanguages[] = $defaultLocale;
        }

        return $browserLanguages;
    }
}
