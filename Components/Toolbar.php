<?php

namespace EzSystems\PlatformUIBundle\Components;

class Toolbar extends Component
{
    protected $children;

    protected $id;

    protected $visible;

    public function __construct($id, array $children)
    {
        $this->id = $id;
        $this->children = $children;
    }

    protected function getVisibleValue()
    {
        return $this->visible ? 'true' : 'false';
    }

    public function __toString()
    {
        $html = '<ez-toolbar id="' . $this->id . '" visible="' . $this->getVisibleValue() . '">';
        foreach ($this->children as $component) {
            $html .= (string)$component;
        }
        $html .= '</ez-toolbar>';

        return $html;
    }

    public function getId()
    {
        return $this->id;
    }

    public function setVisible($visible)
    {
        $this->visible = $visible;
    }

    public function jsonSerialize()
    {
        return [
            'selector' => '#' . $this->id,
            'update' => [
                'attributes' => [
                    'visible' => $this->getVisibleValue(),
                ],
                'children' => $this->children,
            ],
        ];
    }
}
