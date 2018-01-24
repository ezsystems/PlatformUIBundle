<?php
/**
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle\ApplicationConfig\Providers;

use EzSystems\PlatformUIBundle\ApplicationConfig\Provider;
use Symfony\Component\Asset\Packages;
use Symfony\Component\HttpFoundation\RequestStack;

class RootInfo implements Provider
{
    /** @var \Symfony\Component\HttpFoundation\RequestStack */
    private $requestStack;

    /** @var \Symfony\Component\Asset\Packages */
    private $assetsPackages;

    private $externalAssetsDirectory;

    public function __construct(RequestStack $requestStack, Packages $assetsPackages, $externalAssetsDirectory)
    {
        $this->requestStack = $requestStack;
        $this->assetsPackages = $assetsPackages;
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
            'assetRoot' => $this->getAssetUrl('/'),
            'ckeditorPluginPath' => $this->getAssetUrl($this->externalAssetsDirectory) . '/vendors/',
        ];
    }

    /**
     * Returns asset URL without version (if any).
     *
     * @param string $path
     * @return string
     */
    private function getAssetUrl($path)
    {
        $url = $this->assetsPackages->getUrl($path);
        if (!$url) {
            return $path;
        }

        $version = $this->assetsPackages->getVersion($path);
        if (false === strpos($version, '?')) {
            return $url;
        }

        return preg_replace('/\?' . preg_quote($version, '/') . '/', '', $url);
    }
}
