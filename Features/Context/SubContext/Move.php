<?php

/**
 * File containing the Move Functions for context class PlatformUI.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 * @version //autogentag//
 */
namespace EzSystems\PlatformUIBundle\Features\Context\SubContext;

trait Move
{
    /**
     * @When I move :name into the :destiny folder
     */
    public function moveInto($name, $destiny)
    {
        $this->onFullView($name);
        //$this->waitForLoadings();
        $this->clickActionBar('Move');
        //$this->waitForLoadings();
        $this->selectFromUniversalDiscovery("Home/$destiny");
        //$this->waitForLoadings();
        $this->confirmSelection();
        //$this->waitForLoadings();
        $destinyName = explode('/', $destiny);
        $destinyName = end($destinyName);
        $this->iSeeMovedNotification($name, $destinyName);
        //$this->waitForLoadings();
        $this->mapDestinyPath($name, "$destiny/$name");
    }

    /**
     * @Then :name is moved
     */
    public function contentIsMoved($name)
    {
        $path = $this->getDestinyPath($name);
        $this->goToContentWithPath($path);
    }

    /**
     * @Then I am notified that :name has been moved under :destiny
     */
    public function iSeeMovedNotification($name, $destiny)
    {
        $message = "'$name' has been successfully moved under '$destiny'";
        $this->iSeeNotification($message);
    }
}
