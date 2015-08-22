<?php
/**
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle\ApplicationConfig\Providers;

use EzSystems\PlatformUIBundle\ApplicationConfig\Provider;
use Symfony\Bundle\FrameworkBundle\Templating\Helper\AssetsHelper;
use Symfony\Component\HttpFoundation\RequestStack;

class RootInfo implements Provider
{
    /** @var \Symfony\Component\HttpFoundation\RequestStack */
    private $requestStack;

    /** @var \Symfony\Component\Templating\Asset\PackageInterface */
    private $assetsHelper;

    public function __construct(RequestStack $requestStack, AssetsHelper $assetsHelper)
    {
        $this->requestStack = $requestStack;
        $this->assetsHelper = $assetsHelper;
    }

    /**
     * {@inheritdoc}
     */
    public function getCategoryName()
    {
        return 'ezplatform';
    }

    /**
     * @return array|string|int|\JsonSerializable
     */
    public function getConfig()
    {
        return [
            'root' => $this->requestStack->getMasterRequest()->attributes->get('semanticPathInfo'),
            'assetRoot' => $this->assetsHelper->getUrl('/'),
        ];
    }
}
