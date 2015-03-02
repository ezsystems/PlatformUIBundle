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

    public static function getHelperJs( $js = "PlatformUI" )
    {
        $fileName = realpath( __DIR__ . '/../Lib' ) . '/' . $js . '.js';
        return file_get_contents( $fileName );
    }

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
