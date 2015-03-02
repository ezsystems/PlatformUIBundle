<?php
/*
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 * @version //autogentag//
 */
namespace EzSystems\PlatformUIBundle\Features\DriverJS;

/**
 * Implementation of Selenium Driver
 *
 */
class Selenium2 implements DriverJSInterface
{
    /**
     * Adapts javascript to run on Selenium webDriver (nothing needed)
     *
     * @param string    $code javacript code to adapt
     *
     * @return string   adapted javascript code
     */
    public function wrappedFunction( $code )
    {
        return $code;
    }
}
