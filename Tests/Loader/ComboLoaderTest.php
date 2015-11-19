<?php
/**
 * File containing the ComboLoaderTest class.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle\Tests\Loader;

use EzSystems\PlatformUIBundle\Loader\ComboLoader;
use PHPUnit_Framework_TestCase;

class ComboLoaderTest extends PHPUnit_Framework_TestCase
{
    /** @var \EzSystems\PlatformUIBundle\Loader\ComboLoader */
    private $comboLoader;

    /** @var \eZ\Publish\Core\MVC\ConfigResolverInterface */
    private $configResolver;

    /** @var \Symfony\Component\Templating\EngineInterface */
    private $templating;

    public function setUp()
    {
        $this->configResolver = $this->getMockBuilder('\eZ\Publish\Core\MVC\ConfigResolverInterface')
            ->getMock();

        $this->configResolver
            ->method('getParameter')
            ->willReturn('Tests/fixtures/template_module.js');

        $this->templating = $this->getMockBuilder('\Symfony\Component\Templating\EngineInterface')
            ->getMock();

        $this->templating
            ->method('render')
            ->willReturn('template');

        $this->comboLoader = new ComboLoader($this->configResolver, $this->templating, '/yui/', 'Tests/fixtures');
    }

    public function combineFilesContentData()
    {
        return [
            [
                "[1]\n[2]\n",
                [
                    '/script1_js',
                    '/script2_js',
                ],
            ],
            [
                "[3]\n[4]\n[1]\n",
                [
                    'yui1_js',
                    'yui2_js',
                    '/script1_js',
                ],
            ],
            [
                "#a { display: none }\n#b { display: none }\n",
                [
                    'style1_css',
                    'style2_css',
                ],
            ],
            [
                'template',
                [
                    '/tpl/handlebars/template_module_js',
                ],
            ],
        ];
    }

    /**
     * @dataProvider combineFilesContentData
     */
    public function testCombineFilesContent($content, $files)
    {
        $this->assertEquals($content, $this->comboLoader->combineFilesContent($files));
    }

    /**
     * @expectedException \eZ\Publish\API\Repository\Exceptions\NotFoundException
     * @expectedExceptionMessage Could not find 'file' with identifier '/yui/script_js'
     */
    public function testCombineFilesContentNonExistingFile()
    {
        $this->comboLoader->combineFilesContent(['script_js']);
    }

    /**
     * @expectedException \eZ\Publish\API\Repository\Exceptions\NotFoundException
     * @expectedExceptionMessage Could not find 'file type' with identifier '/script_php'
     */
    public function testCombineFilesContentUnknownFileType()
    {
        $this->comboLoader->combineFilesContent(['/script_php']);
    }

    public function getCombinedFilesContentTypeData()
    {
        return [
            [
                'application/javascript',
                [
                    '/script1_js',
                    '/script2_js',
                ],
            ],
            [
                'application/javascript',
                [
                    'yui1_js',
                    'yui2_js',
                    '/script1_js',
                ],
            ],
            [
                'text/css',
                [
                    'style1_css',
                    'style2_css',
                ],
            ],
        ];
    }

    /**
     * @dataProvider getCombinedFilesContentTypeData
     */
    public function testGetCombinedFilesContentType($type, $files)
    {
        $this->assertEquals($type, $this->comboLoader->getCombinedFilesContentType($files));
    }

    /**
     * @expectedException \eZ\Publish\API\Repository\Exceptions\NotFoundException
     * @expectedExceptionMessage Could not find 'file type' with identifier '/script_php'
     */
    public function testGetCombinedFilesContentTypeUnknownFileType()
    {
        $this->comboLoader->getCombinedFilesContentType(['/script_php']);
    }

    /**
     * @expectedException \eZ\Publish\API\Repository\Exceptions\InvalidArgumentException
     * @expectedExceptionMessage Argument 'files' is invalid: can not be empty
     */
    public function testGetCombinedFilesContentTypeNoFiles()
    {
        $this->comboLoader->getCombinedFilesContentType([]);
    }
}
