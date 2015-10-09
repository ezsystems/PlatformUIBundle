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
                // parent:fillFieldWhitValue($field,$value);
                $this->fillFieldHelper($field, $value);
                return true;
            }
        );
    }

    /**
     * Temporary helper
     */
    private function fillFieldHelper($field, $value)
    {
        $fieldNode = $this->getSession()->getPage()->findField($field);
        if ($fieldNode == null) {
            throw new \Exception('Field not found');
        }

        $fieldNode->setValue($value);
        $fieldNode = $this->getSession()->getPage()->findField($field);
        // verication that the field was really filled
        if ($fieldNode->getValue() != $value) {
            throw new \Exception('Failed to set the field value');
        }
    }
}
