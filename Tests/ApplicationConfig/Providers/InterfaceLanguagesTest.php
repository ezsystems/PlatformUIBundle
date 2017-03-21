<?php
/**
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle\Tests\ApplicationConfig\Providers;

use EzSystems\PlatformUIBundle\ApplicationConfig\Providers\InterfaceLanguages;
use PHPUnit_Framework_TestCase;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;

class InterfaceLanguagesTest extends PHPUnit_Framework_TestCase
{
    /**
     * @dataProvider interfaceLanguagesProvider
     */
    public function testGetConfig($defaultLocale, $requestLanguages, $expectedParameters)
    {
        $provider = new InterfaceLanguages($this->createRequestStack($defaultLocale, $requestLanguages));
        self::assertEquals(
            $expectedParameters,
            $provider->getConfig()
        );
    }

    public function interfaceLanguagesProvider()
    {
        return [
            ['en', 'en-US,fr-FR', ['en_US', 'en']],
            ['en', 'fr', ['fr', 'en']],
            ['en', 'fr-FR,fr-BE', ['fr_FR', 'fr', 'en']],
        ];
    }

    /**
     * @return \Symfony\Component\HttpFoundation\RequestStack
     */
    protected function createRequestStack($defaultLocale, $requestLanguages)
    {
        $requestStack = new RequestStack();
        $server = ['HTTP_ACCEPT_LANGUAGE' => $requestLanguages];
        $request = new Request([], [], [], [], [], $server);
        $request->setDefaultLocale($defaultLocale);
        $requestStack->push($request);

        return $requestStack;
    }
}
