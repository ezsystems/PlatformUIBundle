<?php

namespace spec\EzSystems\PlatformUIBundle\Hybrid\DependencyInjection;

use eZ\Bundle\EzPublishCoreBundle\SiteAccess\SiteAccessConfigurationFilter;
use EzSystems\PlatformUIBundle\Hybrid\DependencyInjection\AdminSiteAccessConfigurationFilter;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;

class AdminSiteAccessConfigurationFilterSpec extends ObjectBehavior
{
    function it_is_initializable()
    {
        $this->shouldHaveType(AdminSiteAccessConfigurationFilter::class);
        $this->shouldHaveType(SiteAccessConfigurationFilter::class);
    }

    function it_creates_an_admin_siteaccess_if_there_is_only_one_group()
    {
        $configuration = [
            'list' => ['site'],
            'groups' => ['site_group' => ['site']],
        ];
        $this->filter($configuration)->shouldBe(
            [
                'list' => ['site', 'admin'],
                'groups' => ['site_group' => ['site', 'admin'], 'admin_group' => ['admin']],
            ]
        );
    }

    function it_creates_an_admin_siteaccess_per_group_if_there_are_several_groups()
    {
        $configuration = [
            'list' => ['bluegill', 'rocky'],
            'groups' => [
                'murloc_group' => ['bluegill'],
                'troll_group' => ['rocky'],
            ],
        ];
        $this->filter($configuration)->shouldBe(
            $configuration = [
                'list' => ['bluegill', 'rocky', 'murloc_admin', 'troll_admin'],
                'groups' => [
                    'murloc_group' => ['bluegill', 'murloc_admin'],
                    'troll_group' => ['rocky', 'troll_admin'],
                    'admin_group' => ['murloc_admin', 'troll_admin'],
                ],
            ]
        );

        $this->filter($configuration)->shouldDefineSiteAccessInGroup('troll_admin', 'troll_group');
    }

    public function getMatchers()
    {
        return [
            'defineSiteAccessInGroup' => function (array $configuration, $expectedSiteAccess, $group) {
                return
                    in_array($expectedSiteAccess, $configuration['list']) &&
                    isset($configuration['groups'][$group]) &&
                    in_array($expectedSiteAccess, $configuration['groups'][$group]);
            }
        ];
    }
}
