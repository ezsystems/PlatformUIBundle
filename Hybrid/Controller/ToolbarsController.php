<?php

namespace EzSystems\PlatformUIBundle\Hybrid\Controller;

use eZ\Publish\Core\Base\Exceptions\NotFoundException;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * @todo It needs to be 1 controller for 1 toolbar (discovery, etc).
 */
class ToolbarsController
{
    protected $toolbars;

    protected $visible;

    public function __construct(array $toolbars)
    {
        $this->toolbars = $toolbars;
    }

    protected function getVisibleValue($visible)
    {
        return $visible ? 'true' : 'false';
    }

    /**
     * @param array $visibilities
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function showToolbarsAction($visibilities)
    {
        $html = '';
        foreach ($this->toolbars as $toolbarId => $children) {
            $visibility = isset($visibilities[$toolbarId]) ? $visibilities[$toolbarId] : false;
            $html = sprintf(
                '<ez-toolbar id="%s" visible="%s">',
                $toolbarId,
                $this->getVisibleValue($visibility)
            );
            foreach ($children as $component) {
                $html .= (string)$component;
            }
            $html .= '</ez-toolbar>';
        }

        return new Response($html);
    }

    public function showToolbarsJsonAction(array $visibilities, Request $request)
    {
        $toolbars = [];
        foreach ($this->toolbars as $toolbarId => $children) {
            $visibility = isset($visibilities[$toolbarId]) ? $visibilities[$toolbarId] : false;
            $toolbars[] = [
                'selector' => '#' . $toolbarId,
                'update' => [
                    'attributes' => [
                        'visible' => $this->getVisibleValue($visibility),
                    ],
                    'children' => $children,
                ],
            ];
        }

        return new JsonResponse($toolbars);
    }

    private function jsonSerialize()
    {
    }
}
