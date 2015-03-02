<?php

/*
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 * @version //autogentag//
 */
namespace EzSystems\PlatformUIBundle\Features\DriverJS;
/**
 * Bridge for implenting diferences between webDrivers
 *
 * @author miguel
 */
interface DriverJSInterface
{
    /**
     * Adapts javascript to run on diferent webDrivers
     *
     * @param string    $code javacript code to adapt
     *
     * @return string   adapted javascript code
     */
    public function wrappedFunction( $code );
}
