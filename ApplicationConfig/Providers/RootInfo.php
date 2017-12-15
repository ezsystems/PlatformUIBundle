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

    /** @var \Symfony\Bundle\FrameworkBundle\Templating\Helper\AssetsHelper */
    private $assetsHelper;

    private $externalAssetsDirectory;

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
            'assetRoot' => $this->getAssetUrl('/'),
            'ckeditorPluginPath' => $this->getAssetUrl($this->externalAssetsDirectory) . '/vendors/',
        ];
    }

    /**
     * Returns asset URL without version (if any).
     *
     * @param $path
     * @return string
     */
    private function getAssetUrl($path)
    {
        $url = $this->assetsHelper->getUrl($path);
        if (!$url) {
            return $path;
        }
        $version = $this->assetsHelper->getVersion();

        return preg_replace('/\?' . $version . '/', '', $url);
    }
}
