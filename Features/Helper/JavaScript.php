<?php

/**
 * File containing the Javascript helper class for PlatformUIBundle.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 * @version //autogentag//
 */

namespace EzSystems\PlatformUIBundle\Features\Helper;

/**
 * Helper class for javascript handling.
 */
class JavaScript
{

    /**
     * Fetches the contents of the PlatformUI Javascript helper library to add to the main PlatformUI context
     */
    public static function getHelperJs( $js = "PlatformUI" )
    {
        $fileName = realpath( __DIR__ . '/../Lib' ) . '/' . $js . '.js';
        return file_get_contents( $fileName );
    }

    /**
     * Helper to generaton the Javascript functions arguments when calling them with PHP
     */
    public static function generateFuncArgs()
    {
        $args = func_get_args();
        foreach ( $args as &$arg )
        {
            $arg = json_encode( $arg );
        }
        return implode( ",", $args );
    }

}
