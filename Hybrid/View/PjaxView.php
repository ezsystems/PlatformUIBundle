<?php
/**
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */

namespace EzSystems\PlatformUIBundle\Hybrid\View;

class PjaxView extends HybridUiView implements TitleView, ToolbarsView
{
    /**
     * @var null
     */
    private $title;

    /**
     * @var array
     */
    private $content;

    public function __construct($title, $content)
    {
        $this->title = $title;
        $this->content = $content;

        parent::__construct('', [], 'full');
    }

    /**
     * @return string
     */
    public function getTitle()
    {
        return $this->title;
    }

    public function getContent()
    {
        return $this->content;
    }
}
