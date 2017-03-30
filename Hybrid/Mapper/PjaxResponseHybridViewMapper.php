<?php

namespace EzSystems\PlatformUIBundle\Hybrid\Mapper;

use EzSystems\PlatformUIBundle\Hybrid\View\PjaxView;
use Symfony\Component\HttpFoundation\Response;

class PjaxResponseHybridViewMapper
{
    public function mapResponse(Response $response)
    {
        $responseContent = $response->getContent();

        $errorHandling = libxml_use_internal_errors(true);

        $doc = new \DOMDocument();
        if (!$doc->loadHTML($responseContent)) {
            $errors = libxml_get_errors();
            libxml_use_internal_errors($errorHandling);
            throw new \Exception(
                "Error(s) occurred parsing the PJAX response:\n" .
                implode("\n", $errors)
            );
        }

        $xpath = new \DOMXPath($doc);
        $nodeList = $xpath->query('//div[@data-name="title"]');
        $title = $nodeList[0]->nodeValue;
        $contentNodeList = $xpath->query('//div[@data-name="html"]//section[contains(concat(" ", normalize-space(@class), " "), " ez-serverside-content ")]');

        $contentNode = $contentNodeList[0];
        $attributes = 'ez-view-serversideview';
        foreach (explode(' ', $contentNode->getAttribute('class')) as $classAttribute) {
            if ($classAttribute !== 'ez-view-serversideview') {
                $attributes .= " $classAttribute";
            }
        }
        $content =
            '<div class="'.$attributes.'">' .
            $this->innerHtml($contentNode) .
            '</div>';

        $view = new PjaxView($title, $content);
        $view->enableToolbar('discovery');

        libxml_use_internal_errors($errorHandling);

        return $view;
    }

    private function innerHtml(\DOMElement $element)
    {
        $doc = $element->ownerDocument;

        $html = '';

        foreach ($element->childNodes as $node) {
            $html .= $doc->saveHTML($node);
        }

        return $html;
    }
}
