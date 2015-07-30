<?php
/**
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle\ApplicationConfig\Providers;

use EzSystems\PlatformUIBundle\ApplicationConfig\Provider;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;

/**
 * Provides the anonymous user (REST) ID.
 */
class AnonymousUserId implements Provider
{
    /** @var \Symfony\Component\Routing\RouterInterface */
    private $router;

    /**
     * @var int The configured anonymous user id.
     */
    private $anonymousUserId;

    public function __construct(RouterInterface $router, $anonymousUserId = 10)
    {
        $this->router = $router;
        $this->anonymousUserId = $anonymousUserId;
    }

    public function getConfig()
    {
        return $this->generateUrl('ezpublish_rest_loadUser', ['userId' => $this->anonymousUserId]);
    }

    private function generateUrl($route, array $parameters = [], $referenceType = UrlGeneratorInterface::ABSOLUTE_PATH)
    {
        return $this->router->generate($route, $parameters, $referenceType);
    }
}
