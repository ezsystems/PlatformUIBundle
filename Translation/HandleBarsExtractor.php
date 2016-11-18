<?php

/**
 * File containing the HandleBarsExtractor class.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle\Translation;

use Symfony\Component\Finder\Finder;
use Symfony\Component\Translation\Extractor\ExtractorInterface;
use Symfony\Component\Translation\MessageCatalogue;

/**
 * HandleBarsExtractor extracts translation messages from a PlatformUI's .hbt template.
 */
class HandleBarsExtractor extends PlatformUIExtractor implements ExtractorInterface
{
    /**
     * Default domain for found messages.
     *
     * @var string
     */
    private $defaultDomain = 'messages';

    /**
     * Prefix for found message.
     *
     * @var string
     */
    private $prefix = '';

    /**
     * {@inheritdoc}
     */
    public function extract($resource, MessageCatalogue $catalogue)
    {
        $this->updateResource($resource, 'Resources/public/templates');
        $files = $this->extractFiles($resource);

        foreach ($files as $file) {
            $fileContent = file_get_contents($file->getPathname());
            $this->extractTemplate($fileContent, $catalogue);
        }
    }

    /**
     * @param string $fileContent
     * @param \Symfony\Component\Translation\MessageCatalogue $catalogue
     */
    protected function extractTemplate($fileContent, MessageCatalogue $catalogue)
    {
        $translateParameters = [];

        $translateFound = preg_match_all(
            '/\\{\\{\\s*translate\\s(.*)\\s*\\}\\}/',
            $fileContent,
            $translateParameters,
            PREG_SET_ORDER
        );

        if ($translateFound) {
            foreach ($translateParameters as $translateParameter) {
                $this->extractParameters($translateParameter[1], $catalogue);
            }
        }
    }

    /**
     * @param string $parametersString
     * @param \Symfony\Component\Translation\MessageCatalogue $catalogue
     */
    protected function extractParameters($parametersString, MessageCatalogue $catalogue)
    {
        $parametersResult = [];

        $matchedTranslate = preg_match_all(
            $this->buildParameterRegExp(),
            $parametersString,
            $parametersResult,
            PREG_SET_ORDER
        );

        if ($matchedTranslate && count($parametersResult[0]) === 5) {
            $this->addToCatalogue($catalogue, $parametersResult[0][2], $parametersResult[0][4]);
        }
    }

    /**
     * @param bool $withVariable
     *
     * @return string Regexp
     */
    private function buildParameterRegExp()
    {
        $stringId = "([\\'\\\"])(.*)\\1";
        $domain = "([\\'\\\"])(.*)\\3";
        $parameters = '.*';

        return '/' . $stringId . '\\s+' . $domain . '\\s*' . $parameters . '/U';
    }

    /**
     * @param \Symfony\Component\Translation\MessageCatalogue $catalogue
     * @param string $key
     * @param string $domain
     */
    protected function addToCatalogue(MessageCatalogue $catalogue, $key, $domain)
    {
        $catalogue->set(
            trim($key),
            $this->prefix . trim($key),
            $domain ?: $this->defaultDomain
        );
    }

    /**
     * {@inheritdoc}
     */
    public function setPrefix($prefix)
    {
        $this->prefix = $prefix;
    }

    /**
     * @param string $file
     *
     * @return bool
     */
    protected function canBeExtracted($file)
    {
        return $this->isFile($file) && 'hbt' === pathinfo($file, PATHINFO_EXTENSION);
    }

    /**
     * @param string|array $directory
     *
     * @return Finder|SplFileInfo[]
     */
    protected function extractFromDirectory($directory)
    {
        $finder = new Finder();

        return $finder->files()->name('*.hbt')->in($directory);
    }
}
