<?php
/**
 * File containing the TwigYuiExtension class.
 *
 * @copyright Copyright (C) 1999-2014 eZ Systems AS. All rights reserved.
 * @license http://www.gnu.org/licenses/gpl-2.0.txt GNU General Public License v2
 * @version //autogentag//
 */
namespace EzSystems\PlatformUIBundle\Twig;

use Twig_Environment;
use Twig_Extension;
use Twig_SimpleFunction;
use EzSystems\PlatformUIBundle\EzSystemsPlatformUIBundle;

/**
 * Class TwigYuiExtension
 */
class TwigYuiExtension extends Twig_Extension
{
    /**
     * @var array()
     */
    protected $yui = array();

    /**
     * @var Twig_Environment
     */
    protected $twig;

    /**
     * @param array $config
     */
    public function __construct( array $config )
    {
        $this->yui = $config;
    }

    public function getFunctions()
    {
        return array(
            new Twig_SimpleFunction(
                "ez_platformui_yui_config",
                array( $this, "yuiConfigLoaderFunction" ),
                array( "is_safe" => array( "html" ) )
            )
        );
    }

    public function initRuntime( Twig_Environment $twig )
    {
        $this->twig = $twig;
    }

    /**
     * Calls the twig asset function
     *
     * @param string $asset
     * @return mixed
     */
    protected function asset( $asset )
    {
        return call_user_func( $this->twig->getFunction( "asset" )->getCallable(), $asset );
    }

    /**
     * Returns the YUI loader configuration
     *
     * @return string
     */
    public function yuiConfigLoaderFunction( $configObject = '' )
    {
        foreach ( $this->yui['modules'] as $key => $value )
        {
            // taken from assets:install script
            $fullpath = "bundles/" . preg_replace( "/bundle$/", "", strtolower( EzSystemsPlatformUIBundle::NAME ) ) . "/" . $this->yui['modules'][$key]['path'];
            unset( $this->yui['modules'][$key]['path'] );
            $this->yui['modules'][$key]['fullpath'] = $this->asset( $fullpath );
        }
        $res = '';
        if ( $configObject != '' )
        {
            $res = $configObject . ' = ';
        }
        return $res . ( defined( 'JSON_UNESCAPED_SLASHES' ) ? json_encode( $this->yui, JSON_UNESCAPED_SLASHES ) :  json_encode( $this->yui ) ) . ";";
    }

    /**
     * Returns the name of the extension.
     *
     * @return string The extension name
     */
    public function getName()
    {
        return 'twig_yui_config_extension';
    }
}
