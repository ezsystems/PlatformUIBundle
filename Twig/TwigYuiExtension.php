<?php
/**
 * File containing the TwigYuiExtension class.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */

namespace EzSystems\PlatformUIBundle\Twig;

use eZ\Publish\Core\MVC\ConfigResolverInterface;
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
     * @var Twig_Environment
     */
    protected $twig;

    /**
     * @var \eZ\Publish\Core\MVC\ConfigResolverInterface
     */
    private $configResolver;

    public function __construct( ConfigResolverInterface $configResolver )
    {
        $this->configResolver = $configResolver;
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
     * @param string $configObject
     *
     * @return string
     */
    public function yuiConfigLoaderFunction( $configObject = '' )
    {
        $yui = $this->configResolver->getParameter( 'yui', 'ez_platformui' );
        foreach ( $yui['modules'] as $key => $value )
        {
            $yui['modules'][$key]['fullpath'] = $this->asset( $yui['modules'][$key]['path'] );
            unset( $yui['modules'][$key]['path'] );
        }

        $res = '';
        if ( $configObject != '' )
        {
            $res = $configObject . ' = ';
        }
        return $res . ( defined( 'JSON_UNESCAPED_SLASHES' ) ? json_encode( $yui, JSON_UNESCAPED_SLASHES ) :  json_encode( $yui ) ) . ";";
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
