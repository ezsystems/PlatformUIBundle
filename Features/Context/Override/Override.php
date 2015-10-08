<?php

/**
 * File containing Overriden Functions for context PlatformUI.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 * @version //autogentag//
 */
namespace EzSystems\PlatformUIBundle\Features\Context\Override;

trait Override
{
    /**
     * @Overrride
     * @When I fill in :field with :value
     * @When I set :field as empty
     *
     * Overriden fill fields function
     * Spin function make it possible to retry in case of failure
     */
    public function fillFieldWithValue($field, $value = '')
    {
        $this->spin(
            function () use ($field, $value) {
                parent::fillFieldWithValue($field, $value);
                return true;
            }
        );

    }
}
