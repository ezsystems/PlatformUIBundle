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
        return $this->templating->render(
            'eZPlatformUIBundle:Components:navigationhub.html.twig',
            ['tag' => self::TAG_NAME]
        );
    }

    public function jsonSerialize()
    {
        return [
            'selector' => self::TAG_NAME,
            'update' => (string)$this,
        ];
    }
}
