<?php

namespace EzSystems\PlatformUIBundle\Components;

// TODO find a better name
class MainContent implements Component
{
    const TAG_NAME = 'ez-main-content';

    protected $templating;

    protected $template = null;

    protected $parameters = [];

    protected $result = false;

    public function __construct($templating)
    {
        $this->templating = $templating;
    }

    public function setTemplate($template)
    {
        $this->template = $template;
    }

    public function setParameters($parameters)
    {
        $this->parameters = $parameters;
    }

    public function setResult($result)
    {
        $this->result = $result;
    }

    public function __toString()
    {
        $str = '<' . self::TAG_NAME . '>';
        if ($this->result) {
            $str .= $this->result;
        } elseif ($this->template) {
            $str .= $this->templating->render(
                $this->template,
                $this->parameters
            );
        }
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
