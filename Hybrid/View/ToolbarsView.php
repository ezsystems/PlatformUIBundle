<?php
/**
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */

namespace EzSystems\PlatformUIBundle\Hybrid\View;


interface ToolbarsView
{
    /**
     * @param string $toolbarIdentifier
     *
     * @return bool
     */
    public function isToolbarVisible($toolbarIdentifier);

    /**
     * @return array
     */
    public function getToolbarsConfiguration();

    /**
     * @param $toolbarIdentifier
     *
     * @return \EzSystems\PlatformUIBundle\Hybrid\View\ToolbarsView
     */
    public function enableToolbar($toolbarIdentifier);
}
