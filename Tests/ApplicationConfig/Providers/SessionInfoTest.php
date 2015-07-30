<?php
/**
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle\Tests\ApplicationConfig\Providers;

use EzSystems\PlatformUIBundle\ApplicationConfig\Providers\SessionInfo;
use PHPUnit_Framework_TestCase;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Security\Csrf\CsrfToken;

class SessionInfoTest extends PHPUnit_Framework_TestCase
{
    public function testGetConfig()
    {
        $provider = new SessionInfo(
            $this->createSession(),
            $this->getCsrfTokenManagerMock('intention', 'token'),
            'intention',
            $this->getRouterMock('/api/ezp/v2/user/sessions/the_session_id')
        );

        self::assertEquals(
            [
                'isStarted' => true,
                'name' => 'the_session_name',
                'identifier' => 'the_session_id',
                'csrfToken' => 'token',
                'href' => '/api/ezp/v2/user/sessions/the_session_id',
            ],
            $provider->getConfig()
        );
    }

    /**
     * @return \Symfony\Component\HttpFoundation\Session\SessionInterface|\PHPUnit_Framework_MockObject_MockObject
     */
    private function createSession($parameters = [])
    {
        $resolver = new OptionsResolver();
        $this->configureSessionOptions($resolver);
        $parameters = $resolver->resolve($parameters);

        $session = $this->getMock('\Symfony\Component\HttpFoundation\Session\SessionInterface');
        $session
            ->expects($this->any())
            ->method('isStarted')
            ->will($this->returnValue($parameters['is_started']));
        $session
            ->expects($this->any())
            ->method('getId')
            ->will($this->returnValue($parameters['id']));
        $session
            ->expects($this->any())
            ->method('getName')
            ->will($this->returnValue($parameters['name']));

        return $session;
    }

    private function configureSessionOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults(
            [
                'is_started' => true,
                'id' => 'the_session_id',
                'name' => 'the_session_name',
            ]
        );
    }

    /**
     * @return \Symfony\Component\Routing\RouterInterface|\PHPUnit_Framework_MockObject_MockObject
     */
    private function getRouterMock($expectedValue)
    {
        $mock = $this->getMock('\Symfony\Component\Routing\RouterInterface');
        $mock
            ->expects($this->any())
            ->method('generate')
            ->will($this->returnValue($expectedValue));

        return $mock;
    }

    /**
     * @return \Symfony\Component\Security\Csrf\CsrfTokenManagerInterface|\PHPUnit_Framework_MockObject_MockObject
     */
    private function getCsrfTokenManagerMock($intention, $tokenValue)
    {
        $token = new CsrfToken(null, $tokenValue);
        $mock = $this->getMock('\Symfony\Component\Security\Csrf\CsrfTokenManagerInterface');
        $mock
            ->expects($this->any())
            ->method('getToken')
            ->with($intention)
            ->will($this->returnValue($token));

        return $mock;
    }
}
