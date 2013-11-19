<?php
/**
 * File containing the TwigYuiExtension class.
 *
 * @copyright Copyright (C) 1999-2013 eZ Systems AS. All rights reserved.
 * @license http://www.gnu.org/licenses/gpl-2.0.txt GNU General Public License v2
 * @version //autogentag//
 */
namespace EzSystems\EditorialBundle\Twig;

use Twig_Environment;
use Twig_Extension;
use Twig_SimpleFunction;
use EzSystems\EditorialBundle\EzSystemsEditorialBundle;

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
                "ez_editorial_yui_config",
                array( $this, "yuiFunction" ),
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
    public function yuiFunction( $configObject )
    {
        foreach ( $this->yui['modules'] as $key => $value )
        {
            // taken from assets:install script
            $fullpath = "bundles/" . preg_replace( "/bundle$/", "", strtolower( EzSystemsEditorialBundle::NAME ) ) . "/" . $this->yui['modules'][$key]['path'];
            unset( $this->yui['modules'][$key]['path'] );
            $this->yui['modules'][$key]['fullpath'] = $this->asset( $fullpath );
        }
        return $configObject . " = " . json_encode( $this->yui, JSON_UNESCAPED_SLASHES ) . ";";
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
