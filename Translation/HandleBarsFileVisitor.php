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

class HandleBarsFileVisitor implements FileVisitorInterface
{
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
        if ($file->getExtension() !== 'hbt') {
            return;
        }

        $fileContent = file_get_contents($file->getPathname());

        $messages = $this->extractTemplate($fileContent, $catalogue);
        foreach ($messages as $message) {
            $message->addSource(new FileSource($file->getPathname()));
            $catalogue->add($message);
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

    /**
     * @param string $fileContent
     * @param MessageCatalogue $catalogue
     *
     * @return Message[]
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

        $messages = [];
        if ($translateFound) {
            foreach ($translateParameters as $translateParameter) {
                $message = $this->extractParameters($translateParameter[1], $catalogue);
                if ($message !== null) {
                    $messages[] = $message;
                }
            }
        }

        return $messages;
    }

    /**
     * @param string $parametersString
     * @return Message|null
     */
    protected function extractParameters($parametersString)
    {
        $parametersResult = [];

        $matchedTranslate = preg_match_all(
            $this->buildParameterRegExp(),
            $parametersString,
            $parametersResult,
            PREG_SET_ORDER
        );

        if ($matchedTranslate && count($parametersResult[0]) === 5) {
            return new Message(trim($parametersResult[0][2]), $parametersResult[0][4]);
        }

        return null;
    }

    /**
     * @return string Regexp
     */
    private function buildParameterRegExp()
    {
        $stringId = "([\\'\\\"])(.*)\\1";
        $domain = "([\\'\\\"])(.*)\\3";
        $parameters = '.*';

        return '/' . $stringId . '\\s+' . $domain . '\\s*' . $parameters . '/U';
    }
}
