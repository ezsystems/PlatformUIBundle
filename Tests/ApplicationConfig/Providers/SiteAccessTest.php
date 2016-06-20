<?php
/**
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle\Tests\ApplicationConfig\Providers;

use eZ\Publish\Core\MVC\Symfony\SiteAccess as SiteAccessValue;
use EzSystems\PlatformUIBundle\ApplicationConfig\Providers\SiteAccess;
use PHPUnit_Framework_TestCase;

class SiteAccessTest extends PHPUnit_Framework_TestCase
{
    public function testGetConfig()
    {
        $mockMatcher = $this->getMock('eZ\Publish\Core\MVC\Symfony\SiteAccess\Matcher');
        $siteAccessValue = new SiteAccessValue('site', 'default', $mockMatcher);
        $provider = new SiteAccess();
        $provider->setSiteAccess($siteAccessValue);
        self::assertEquals(
            [
                'name' => $siteAccessValue->name,
                'matchingType' => $siteAccessValue->matchingType,
                'matcherName' => $siteAccessValue->matcher->getName(),
            ],
            $provider->getConfig()
        );
    }
}
