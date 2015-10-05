<?php
/**
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle\ApplicationConfig\Providers;

use eZ\Publish\API\Repository\LanguageService;
use EzSystems\PlatformUIBundle\ApplicationConfig\Provider;

/**
 * Provides the languages available in content repository.
 */
class Languages implements Provider
{
    /**
     * @var LanguageService
     */
    private $languageService;

    public function __construct(LanguageService $languageService)
    {
        $this->languageService = $languageService;
    }

    public function getConfig()
    {
        $languages = array();
        foreach ($this->languageService->loadLanguages() as $language) {
            $languages[] = array(
                'id' => $language->id,
                'name' => $language->name,
                'languageCode' => $language->languageCode,
                'enabled' => $language->enabled,
            );
        }

        return $languages;
    }
}
