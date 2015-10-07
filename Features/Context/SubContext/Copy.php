<?php

/**
 * File containing the Copy Functions for context class PlatformUI.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 * @version //autogentag//
 */
namespace EzSystems\PlatformUIBundle\Features\Context\SubContext;

trait Copy
{
    /**
     * @Then I am notified that :name has been copied under :destiny
     */
    public function iSeeCopiedNotification($name, $destiny)
    {
        $message = "'$name' has been successfully copied under '$destiny'";
        $this->iSeeNotification($message);
    }
}
