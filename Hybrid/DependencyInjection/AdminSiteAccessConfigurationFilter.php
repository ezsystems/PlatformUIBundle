<?php
/**
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */

namespace EzSystems\PlatformUIBundle\Hybrid\DependencyInjection;

use eZ\Bundle\EzPublishCoreBundle\SiteAccess\SiteAccessConfigurationFilter;

class AdminSiteAccessConfigurationFilter implements SiteAccessConfigurationFilter
{
    public function filter(array $configuration)
    {
        $multiSite = count($configuration['groups']) > 1;
        $updatedConfiguration = $configuration;
        $updatedConfiguration['groups']['admin_group'] = [];

        foreach (array_keys($configuration['groups']) as $groupName) {
            $adminSiteAccessName = $multiSite
                ? str_replace('_group', '', $groupName) . '_admin'
                : 'admin';
            $updatedConfiguration['list'][] = $adminSiteAccessName;
            $updatedConfiguration['groups'][$groupName][] = $adminSiteAccessName;
            $updatedConfiguration['groups']['admin_group'][] = $adminSiteAccessName;
        }

        return $updatedConfiguration;
    }
}
