<?php
namespace EzSystems\PlatformUIBundle\Generator;

use Sensio\Bundle\GeneratorBundle\Generator\Generator;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\DependencyInjection\Container;

/**
 * Generates a PlatformUI plugin skeleton.
 */
class PlatformUIPluginGenerator extends Generator
{
    /**
     * @var \Symfony\Component\Filesystem\Filesystem
     */
    private $filesystem;

    public function __construct(Filesystem $filesystem)
    {
        $this->filesystem = $filesystem;
    }

    public function generate($namespace, $bundle, $dir, $format, $structure)
    {
        $dir .= '/' . strtr($namespace, '\\', '/');
        if (file_exists($dir)) {
            if (!is_dir($dir)) {
                throw new \RuntimeException(sprintf('Unable to generate the bundle as the target directory "%s" exists but is a file.', realpath($dir)));
            }
            $files = scandir($dir);
            if ($files != array('.', '..')) {
                throw new \RuntimeException(sprintf('Unable to generate the bundle as the target directory "%s" is not empty.', realpath($dir)));
            }
            if (!is_writable($dir)) {
                throw new \RuntimeException(sprintf('Unable to generate the bundle as the target directory "%s" is not writable.', realpath($dir)));
            }
        }

        $basename = substr($bundle, 0, -6);
        $parameters = array(
            'namespace' => $namespace,
            'bundle' => $bundle,
            'format' => $format,
            'bundle_basename' => $basename,
            'extension_alias' => Container::underscore($basename),
        );

        if ('xml' === $format || 'annotation' === $format) {
            $this->renderFile('bundle/yui.xml.twig', $dir . '/Resources/config/yui.xml', $parameters);
            $this->renderFile('bundle/css.xml.twig', $dir . '/Resources/config/css.xml', $parameters);
        } else {
            $this->renderFile('bundle/yui.' . $format . '.twig', $dir . '/Resources/config/yui.' . $format, $parameters);
            $this->renderFile('bundle/css.' . $format . '.twig', $dir . '/Resources/config/css.' . $format, $parameters);
        }

        $this->renderFile('bundle/Bundle.php.twig', $dir . '/' . $bundle . '.php', $parameters);
        $this->renderFile('bundle/PlatformUIPluginExtension.php.twig', $dir . '/DependencyInjection/' . $basename . 'Extension.php', $parameters);
        $this->renderFile('bundle/Configuration.php.twig', $dir . '/DependencyInjection/Configuration.php', $parameters);

        if ($structure) {
            $this->renderFile('bundle/messages.fr.xlf', $dir . '/Resources/translations/messages.fr.xlf', $parameters);

            $this->filesystem->mkdir($dir . '/Resources/doc');
            $this->filesystem->touch($dir . '/Resources/doc/index.rst');
            $this->filesystem->mkdir($dir . '/Resources/translations');
            $this->filesystem->mkdir($dir . '/Resources/public/css');
            $this->filesystem->mkdir($dir . '/Resources/public/images');
            $this->filesystem->mkdir($dir . '/Resources/public/js');
        }
    }
}
