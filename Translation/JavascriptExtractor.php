<?php

/**
 * File containing the JavascriptExtractor class.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle\Translation;

use Symfony\Component\Finder\Finder;
use Symfony\Component\Process\Process;
use Symfony\Component\Translation\Extractor\ExtractorInterface;
use Symfony\Component\Translation\MessageCatalogue;

/**
 * JavascriptExtractor extracts translation messages from a PlatformUI's .js files.
 *
 * Note: this script relies on a nodejs script: `/bin/Translation/translation_dumper.js`
 */
class JavascriptExtractor extends PlatformUIExtractor implements ExtractorInterface
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
     * Path of translation dumper.
     *
     * @var string
     */
    private $translationDumperPath;

    public function __construct($translationDumperPath)
    {
        $this->translationDumperPath = $translationDumperPath;
    }

    /**
     * {@inheritdoc}
     */
    public function extract($resource, MessageCatalogue $catalogue)
    {
        $this->updateResource($resource, 'Resources/public/js');
        $files = $this->extractFiles($resource);

        foreach ($files as $file) {
            $process = new Process('node ' . $this->translationDumperPath . ' ' . escapeshellarg($file));
            $process->run();

            $result = json_decode($process->getOutput());

            if ($result && $result->translationsFound) {
                foreach ($result->translationsFound as $translation) {
                    $this->addToCatalogue($catalogue, $translation->key, $translation->domain);
                }
            }
        }
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
        return $this->isFile($file) && 'js' === pathinfo($file, PATHINFO_EXTENSION);
    }

    /**
     * @param string|array $directory
     *
     * @return Finder|SplFileInfo[]
     */
    protected function extractFromDirectory($directory)
    {
        $finder = new Finder();

        return $finder->files()->name('*.js')->in($directory);
    }
}
