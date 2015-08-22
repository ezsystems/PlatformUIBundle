<?php
/**
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle\ApplicationConfig;

/**
 * Aggregates a set of ApplicationConfig Providers.
 */
class Aggregator implements Provider
{
    const CATEGORY_NAME = 'ezsystems';

    /** @var Provider[] ApplicationConfigProviders, indexed by namespace string*/
    private $providers = [];

    /** @var Provider[] ApplicationConfigProviders, indexed by namespace string*/
    private $bundleProviders = [];

    /**
     * Adds an array of Provider to the aggregator.
     * @param \EzSystems\PlatformUIBundle\ApplicationConfig\Provider[] $providers
     */
    public function addProviders(array $providers)
    {
        $this->providers = array_merge($this->providers, $providers);
    }

    /**
     * Adds an array of custom bundle Provider to the aggregator.
     * @param \EzSystems\PlatformUIBundle\ApplicationConfig\Provider[] $providers
     */
    public function addBundleProviders(array $providers)
    {
        $this->bundleProviders = array_merge($this->bundleProviders, $providers);
    }

    /**
     * {@inheritdoc}
     */
    public function getCategoryName()
    {
        return self::CATEGORY_NAME;
    }

    /**
     * Aggregates the config from the providers, and returns a hash with the namespace as the key, and the config
     * as the value.
     * @return array
     */
    public function getConfig()
    {
        $category = $this->getCategoryName();

        $config = [$category => []];

        foreach ($this->providers as $key => $provider) {
            $config[$key] = $provider->getConfig();
        }

        foreach ($this->bundleProviders as $key => $provider) {
            $providerCategory = $provider->getCategoryName();
            if (!isset($config[$category][$providerCategory])) {
                $config[$category][$providerCategory] = [];
            }
            $config[$category][$providerCategory][$key] = $provider->getConfig();
        }

        return $config;
    }
}
