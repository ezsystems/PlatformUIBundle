<?php
/**
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle\ApplicationConfig\Providers;

use eZ\Publish\Core\MVC\ConfigResolverInterface;
use eZ\Publish\Core\MVC\Symfony\SiteAccess;
use EzSystems\PlatformUIBundle\ApplicationConfig\Provider;

class SiteAccesses implements Provider
{
    /** @var ConfigResolverInterface */
    private $configResolver;

    /** @var array */
    private $siteAccessList;

    /* @var string */
    private $currentSiteAccess;

    /**
     * @param ConfigResolverInterface $configResolver
     * @param array $siteAccessList
     */
    public function __construct(ConfigResolverInterface $configResolver, array $siteAccessList, SiteAccess $currentSiteAccess)
    {
        $this->configResolver = $configResolver;
        $this->siteAccessList = $siteAccessList;
        $this->currentSiteAccess = $currentSiteAccess->name;
    }

    public function getConfig()
    {
        $siteAccesses = array();

        foreach ($this->siteAccessList as $siteAccess) {
            if ($this->configResolver->hasParameter('languages', null, $siteAccess)) {
                $siteAccesses[$siteAccess]['languages'] = $this->configResolver->getParameter('languages', null, $siteAccess);
                if ($siteAccess == $this->currentSiteAccess) {
                    $siteAccesses[$siteAccess]['current'] = true;
                }
            }
        }

        return $siteAccesses;
    }
}
