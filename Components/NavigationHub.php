<?php

namespace EzSystems\PlatformUIBundle\Components;

class NavigationHub extends Component
{
    const TAG_NAME = 'ez-navigation-hub';

    protected $templating;

    public function __construct($templating)
    {
        $this->templating = $templating;
    }

    public function __toString()
    {
        $str = '<' . self::TAG_NAME . '>';
        $str .= $this->templating->render(
            'eZPlatformUIBundle:Components:navigationhub.html.twig'
        );
        $str .= '</' . self::TAG_NAME . '>';

        return $str;
    }

    public function jsonSerialize()
    {
        return [
            'selector' => self::TAG_NAME,
            'update' => (string)$this,
        ];
    }
}
