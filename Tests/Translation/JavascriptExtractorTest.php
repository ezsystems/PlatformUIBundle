<?php

/**
 * File containing the JavascriptExtractorTest class.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle\Tests\Translation;

use EzSystems\PlatformUIBundle\Translation\JavascriptExtractor;
use Symfony\Component\Translation\MessageCatalogue;

class JavascriptExtractorTest extends \PHPUnit_Framework_TestCase
{
    /**
     * @dataProvider resourceProvider
     */
    public function testExtractWithFiles($resource, $translationDumperPath)
    {
        $extractor = new JavascriptExtractor($resource, $translationDumperPath);
        $catalogue = new MessageCatalogue('en');
        $extractor->extract('/tmp/whatever', $catalogue);

        $this->assertTrue($catalogue->has('test.translation.result1', 'testdomain'));
        $this->assertEquals(
            'test.translation.result1',
            $catalogue->get('test.translation.result1', 'testdomain')
        );

        $this->assertFalse($catalogue->has('test.translation.fail', 'testdomain'));
    }

    /**
     * @return array
     */
    public function resourceProvider()
    {
        $directory = __DIR__ . '/../fixtures/extractor/';
        $translationDumperPath = __DIR__ . '/../../bin/Translation/translation_dumper.js';

        return array(
            array($directory . 'with_translation.js', $translationDumperPath),
        );
    }
}
