<?php
/**
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle\ApplicationConfig\Providers;

use EzSystems\PlatformUIBundle\ApplicationConfig\Provider;
use eZ\Publish\Core\MVC\Symfony\SiteAccess as SiteAccessValue;

/**
 * SiteAccess provider.
 */
class SiteAccess implements Provider
{
    /** @var SiteAccessValue */
    private $siteAccess;

    public function setSiteAccess(SiteAccessValue $siteAccess)
    {
        $this->siteAccess = $siteAccess;
    }

    public function getConfig()
    {
        return [
            'name' => $this->siteAccess->name,
            'matchingType' => $this->siteAccess->matchingType,
            'matcherName' => $this->siteAccess->matcher ? $this->siteAccess->matcher->getName() : '',
        ];
    }
}
