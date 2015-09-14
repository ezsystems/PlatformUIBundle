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

    public function __construct(RequestStack $requestStack, AssetsHelper $assetsHelper, $externalAssetsDirectory)
    {
        $this->requestStack = $requestStack;
        $this->assetsHelper = $assetsHelper;
        $this->externalAssetsDirectory = $externalAssetsDirectory;
    }

    /**
     * Returns the apiRoot for the current application environment, ie the
     * prefix to use for all api/AJAX calls.
     *
     * @return string
     */
    protected function getApiRoot()
    {
        $request = $this->requestStack->getMasterRequest();
        $pathinfo = $request->getPathInfo();
        $semanticPathinfo = $request->attributes->get('semanticPathinfo', $pathinfo);

        return $request->getBaseUrl() . substr($pathinfo, 0, strpos($pathinfo, $semanticPathinfo)) . '/';
    }

    /**
     * @return array|string|int|\JsonSerializable
     */
    public function getConfig()
    {
        return [
            'root' => $this->requestStack->getMasterRequest()->attributes->get('semanticPathinfo'),
            'apiRoot' => $this->getApiRoot(),
            'assetRoot' => $this->assetsHelper->getUrl('/'),
            'ckeditorPluginPath' => $this->assetsHelper->getUrl($this->externalAssetsDirectory) . '/vendors/',
        ];
    }
}
