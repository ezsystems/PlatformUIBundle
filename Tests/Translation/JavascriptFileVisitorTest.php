<?php

/**
 * File containing the JavascriptExtractorTest class.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle\Tests\Translation;

use EzSystems\PlatformUIBundle\Translation\JavascriptFileVisitor;
use JMS\TranslationBundle\Model\Message;
use JMS\TranslationBundle\Model\MessageCatalogue;

class JavascriptFileVisitorTest extends \PHPUnit_Framework_TestCase
{
    /**
     * @dataProvider resourceProvider
     */
    public function testVisitFile($resource)
    {
        $visitor = new JavascriptFileVisitor(
            $translationDumperPath = __DIR__ . '/../../bin/Translation/translation_dumper.js'
        );
        $catalogue = new MessageCatalogue('en');
        $visitor->visitFile($resource, $catalogue);

        $this->assertTrue($catalogue->has(new Message('test.translation.result1', 'testdomain')));
        $this->assertEquals(
            'test.translation.result1',
            $catalogue->get('test.translation.result1', 'testdomain')
        );

        $this->assertFalse($catalogue->has(new Message('test.translation.fail', 'testdomain')));
    }

    /**
     * @return array
     */
    public function resourceProvider()
    {
        return [[new \SplFileInfo(__DIR__ . '/../fixtures/extractor/Resources/public/js/with_translation.js')]];
    }
}
