<?php
/**
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle\Translation;

use JMS\TranslationBundle\Model\FileSource;
use JMS\TranslationBundle\Model\Message;
use JMS\TranslationBundle\Model\MessageCatalogue;
use JMS\TranslationBundle\Translation\Extractor\FileVisitorInterface;
use Symfony\Component\Process\Process;

class JavascriptFileVisitor implements FileVisitorInterface
{
    private $translationDumperPath;

    public function __construct($translationDumperPath)
    {
        $this->translationDumperPath = $translationDumperPath;
    }

    /**
     * Called for non-specially handled files.
     *
     * This is not called if handled by a more specific method.
     *
     * @param \SplFileInfo $file
     * @param MessageCatalogue $catalogue
     */
    public function visitFile(\SplFileInfo $file, MessageCatalogue $catalogue)
    {
        if ($file->getExtension() !== 'js') {
            return;
        }

        $process = new Process('node ' . $this->translationDumperPath . ' ' . escapeshellarg($file));
        $process->run();

        $result = json_decode($process->getOutput());

        if ($result && $result->translationsFound) {
            foreach ($result->translationsFound as $translation) {
                $message = new Message($translation->key, $translation->domain);
                $message->addSource(new FileSource($file->getPathname()));
                $catalogue->add($message);
            }
        }
    }

    /**
     * Called when a PHP file is encountered.
     *
     * The visitor already gets a parsed AST passed along.
     *
     * @param \SplFileInfo $file
     * @param MessageCatalogue $catalogue
     * @param array $ast
     */
    public function visitPhpFile(\SplFileInfo $file, MessageCatalogue $catalogue, array $ast)
    {
    }

    /**
     * Called when a Twig file is encountered.
     *
     * The visitor already gets a parsed AST passed along.
     *
     * @param \SplFileInfo $file
     * @param MessageCatalogue $catalogue
     * @param \Twig_Node $ast
     */
    public function visitTwigFile(\SplFileInfo $file, MessageCatalogue $catalogue, \Twig_Node $ast)
    {
    }
}
