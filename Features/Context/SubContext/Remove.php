<?php

/**
 * File containing the Remove Functions for context class PlatformUI.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 * @version //autogentag//
 */
namespace EzSystems\PlatformUIBundle\Features\Context\SubContext;

trait Remove
{
    /**
     * @When I remove :name
     */
    public function removeContent($name)
    {
        $this->onFullView($name);
        $this->clickActionBar('Send to Trash');
    }

    /**
     * Confirm content removal.
     * @When I confirm the removal
     */
    public function confirmRemoval()
    {
        $this->clickElementByText('Confirm', '.ez-confirmbox-confirm');
    }

    /**
     * Cancel content removal.
     * @When I do not confirm the removal
     * @When I cancel the removal
     */
    public function cancelRemoval()
    {
        $this->clickElementByText('Cancel', '.ez-confirmbox-cancel');
    }

    /**
     * @Then I am asked to confirm if I am sure that I want to send the content to trash
     */
    public function iSeeConfirmationBox()
    {
        $element = $this->getElementByText(
            'Are you sure you want to send this content to trash?',
            '.ez-confirmbox-title'
        );
        if (!$element) {
            throw new \Exception('Confirmation box not found');
        }
    }

    /**
     * @Then I see a confirmation button
     */
    public function iSeeConfirmation()
    {
        $element = $this->getElementByText('Confirm', '.ez-confirmbox-confirm');
        if (!$element) {
            throw new \Exception('Confirmation button not found');
        }
    }

    /**
     * @Then I see a cancel button
     */
    public function iSeeCancel()
    {
        $element = $this->getElementByText('Cancel', '.ez-confirmbox-cancel');
        if (!$element) {
            throw new \Exception('Cancel button not found');
        }
    }
}
