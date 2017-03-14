<?php
/**
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */

namespace EzSystems\PlatformUIBundle\Hybrid\View;

use eZ\Publish\Core\MVC\Symfony\View\BaseView;
use eZ\Publish\Core\MVC\Symfony\View\View;

class HybridUiView extends BaseView implements View, TitleView, ToolbarsView
{
    /**
     * @var string
     */
    private $title;

    /**
     * Stores the toolbars configuration.
     * The key is the toolbar identifier, and the value the visibiliy
     * of the identified toolbar, a boolean.
     * @var array
     */
    private $toolbarsConfig;

    public function __construct($templateIdentifier = null, array $parameters = [], $title = null)
    {
        $this->title = $title;
        parent::__construct($templateIdentifier, $parameters, 'full');
    }

    public function getTitle()
    {
        return $this->title;
    }

    /**
     * @param $toolbarIdentifier
     *
     * @return bool
     */
    public function isToolbarVisible($toolbarIdentifier)
    {
        return isset($this->toolbarsConfig[$toolbarIdentifier]) ?
            (bool)$this->toolbarsConfig[$toolbarIdentifier] :
            false;
    }

    public function getToolbarsConfiguration()
    {
        return $this->toolbarsConfig;
    }
    /**
     * @param $toolbarIdentifier
     *
     * @return \EzSystems\PlatformUIBundle\Hybrid\View\ToolbarsView
     */
    public function enableToolbar($toolbarIdentifier)
    {
        $this->toolbarsConfig[$toolbarIdentifier] = true;
    }
}
