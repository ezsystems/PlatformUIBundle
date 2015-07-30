<?php
/**
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle\ApplicationConfig\Providers;

use EzSystems\PlatformUIBundle\ApplicationConfig\Provider;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Security\Csrf\CsrfTokenManagerInterface;

/**
 * Provides the Session info, if a session is started.
 */
class SessionInfo implements Provider
{
    /** @var \Symfony\Component\HttpFoundation\Session\SessionInterface */
    private $session;

    /** @var \Symfony\Component\Security\Csrf\CsrfTokenManagerInterface */
    private $csrfTokenManager;

    /** @var string */
    private $csrfTokenIntention;

    /** @var \Symfony\Component\Routing\RouterInterface */
    private $router;

    public function __construct(
        SessionInterface $session,
        CsrfTokenManagerInterface $csrfTokenManager,
        $csrfTokenIntention,
        RouterInterface $router
    ) {
        $this->session = $session;
        $this->csrfTokenManager = $csrfTokenManager;
        $this->csrfTokenIntention = $csrfTokenIntention;
        $this->router = $router;
    }

    public function getConfig()
    {
        $sessionInfo = ['isStarted' => false];
        if ($this->session->isStarted()) {
            $sessionInfo['isStarted'] = true;
            $sessionInfo['name'] = $this->session->getName();
            $sessionInfo['identifier'] = $this->session->getId();
            $sessionInfo['csrfToken'] = $this->csrfTokenManager->getToken($this->csrfTokenIntention)->getValue();
            $sessionInfo['href'] = $this->generateUrl(
                'ezpublish_rest_deleteSession',
                ['sessionId' => $this->session->getId()]
            );
        }

        return $sessionInfo;
    }

    private function generateUrl($route, array $parameters = [], $referenceType = UrlGeneratorInterface::ABSOLUTE_PATH)
    {
        return $this->router->generate($route, $parameters, $referenceType);
    }
}
