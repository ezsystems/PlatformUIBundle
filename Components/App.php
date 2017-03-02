<?php

namespace EzSystems\PlatformUIBundle\Components;

use Symfony\Component\HttpFoundation\Request;
use EzSystems\PlatformUIBundle\Components\Component;
use EzSystems\PlatformUIBundle\Components\NavigationHub;
use EzSystems\PlatformUIBundle\Components\MainContent;

class App extends Component
{
    const TAG_NAME = 'ez-platformui-app';

    protected $mainContent;

    protected $navigationHub;

    protected $toolbars;

    protected $templating;

    protected $title;

    public function __construct(
        $templating,
        MainContent $content,
        NavigationHub $navigationHub,
        array $toolbars
    ) {
        $this->templating = $templating;
        $this->mainContent = $content;
        $this->navigationHub = $navigationHub;
        $this->toolbars = $toolbars;
    }

    public function setConfig(array $config)
    {
        $this->title = $config['title'];
        $this->setToolbarsVisibility($config['toolbars']);
        $this->mainContent->setTemplate($config['mainContent']['template']);
        $this->mainContent->setParameters($config['mainContent']['parameters']);
    }

    public function getTitle()
    {
        return $this->title;
    }

    protected function setToolbarsVisibility($config)
    {
        foreach ($this->toolbars as $toolbar) {
            $toolbar->setVisible((bool)$config[$toolbar->getId()]);
        }
    }

    public function __toString()
    {
        $str = '<' . self::TAG_NAME . '>';
        $str .= $this->templating->render(
            'eZPlatformUIBundle:Components:app.html.twig',
            array(
                'navigationHub' => $this->navigationHub,
                'toolbars' => $this->toolbars,
                'mainContent' => $this->mainContent,
            )
        );
        $str .= '</' . self::TAG_NAME . '>';

        return $str;
    }

    public function jsonSerialize()
    {
        return [
            'selector' => self::TAG_NAME,
            'update' => [
                'attributes' => [
                    'title' => $this->title,
                ],
                'children' => array_merge(
                    $this->toolbars,
                    [$this->navigationHub, $this->mainContent]
                ),
            ]
        ];
    }
}
