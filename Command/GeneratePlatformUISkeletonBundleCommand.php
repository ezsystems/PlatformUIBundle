<?php
namespace EzSystems\PlatformUIBundle\Command;

use EzSystems\PlatformUIBundle\Generator\PlatformUIPluginGenerator;
use Sensio\Bundle\GeneratorBundle\Command\GenerateBundleCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class GeneratePlatformUISkeletonBundleCommand extends GenerateBundleCommand
{
    /**
     * @see Command
     */
    protected function configure()
    {
        parent::configure();
        $this->setName('generate:ez:platform-ui-plugin');
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $this->getGenerator(
            $this->getContainer()->get('kernel')->getBundle('eZPlatformUIBundle')
        );
        parent::execute($input, $output);
    }

    protected function createGenerator()
    {
        return new PlatformUIPluginGenerator($this->getContainer()->get('filesystem'));

        // $thisBundle = $this->getContainer()->get('kernel')->getBundle('BDEzPlatformUIExtensionSkeletonGeneratorBundle');
        // $skeletonDirs = $this->getSkeletonDirs($thisBundle);
        // $generator->setSkeletonDirs($skeletonDirs);
        // return $generator;
    }
}
