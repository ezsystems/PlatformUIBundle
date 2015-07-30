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
    /** @var Provider[] ApplicationConfigProviders, indexed by namespace string*/
    private $providers = [];

    /**
     * Adds an array of Provider to the aggregator.
     * @param \EzSystems\PlatformUIBundle\ApplicationConfig\Provider[] $providers
     */
    public function addProviders(array $providers)
    {
        $this->providers = array_merge($this->providers, $providers);
    }

    /**
     * Aggregates the config from the providers, and returns a hash with the namespace as the key, and the config
     * as the value.
     * @return array
     */
    public function getConfig()
    {
        $config = [];
        foreach ($this->providers as $key => $provider) {
            $config[$key] = $provider->getConfig();
        }

        return $config;
    }
}
