<?php
/**
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle\ApplicationConfig\Providers;

use eZ\Publish\Core\MVC\ConfigResolverInterface;
use eZ\Publish\Core\MVC\Symfony\SiteAccess;
use EzSystems\PlatformUIBundle\ApplicationConfig\Provider;

/**
 * Provides list of siteaccesses including information about repository.
 */
class SiteaccessList implements Provider
{
    /** @var ConfigResolverInterface */
    private $configResolver;

    /** @var SiteAccess */
    private $currentSiteacess;

    /** @var array */
    private $siteaccesses;

    /** @var array */
    private $siteaccessGroups;

    /** @var array */
    private $repositories;

    /**
     * @param ConfigResolverInterface $configResolver
     * @param $currentSiteaccess
     * @param $siteaccesses
     * @param $siteaccessGroups
     * @param $repositories
     */
    public function __construct(
        $configResolver,
        $currentSiteaccess,
        $siteaccesses,
        $siteaccessGroups,
        $repositories
    ) {
        $this->configResolver = $configResolver;
        $this->currentSiteacess = $currentSiteaccess;
        $this->siteaccesses = $siteaccesses;
        $this->siteaccessGroups = $siteaccessGroups;
        $this->repositories = $repositories;
    }

    public function getConfig()
    {
        return [
            'currentSiteaccess' => $this->currentSiteacess->name,
            'repository' => $this->getRepositoryName(),
            'siteaccessList' => $this->siteaccesses,
            'siteaccessGroups' => $this->siteaccessGroups,
            'siteaccessesByRepository' => $this->getSiteaccessesByRepository(),
        ];
    }

    /**
     * Gets a list of siteaccesses grouped by repository.
     *
     * @return array
     */
    private function getSiteaccessesByRepository()
    {
        $siteaccesses = [];
        foreach ($this->siteaccesses as $siteaccess) {
            $repository = $this->resolveRepositoryName(
                $this->configResolver->getParameter('repository', null, $siteaccess)
            );

            if (!isset($siteaccesses[$repository])) {
                $siteaccesses[$repository] = [];
            }

            $siteaccesses[$repository][] = $siteaccess;
        }

        return $siteaccesses;
    }

    /**
     * Gets current repository name.
     *
     * @return string
     */
    private function getRepositoryName()
    {
        $repository = $this->configResolver->getParameter('repository');

        return $this->resolveRepositoryName($repository);
    }

    /**
     * Resolves repository name.
     *
     * @param string|null $repository
     *
     * @return string
     */
    private function resolveRepositoryName($repository)
    {
        if ($repository === null) {
            $aliases = array_keys($this->repositories);
            $repository = array_shift($aliases);
        }

        return $repository;
    }
}
