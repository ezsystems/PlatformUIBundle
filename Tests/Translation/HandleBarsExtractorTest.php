<?php

/**
 * File containing the HandleBarsExtractorTest class.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle\Tests\Translation;

use EzSystems\PlatformUIBundle\Translation\HandleBarsExtractor;
use Symfony\Component\Translation\MessageCatalogue;

class HandleBarsExtractorTest extends \PHPUnit_Framework_TestCase
{
    /**
     * @dataProvider getExtractData
     */
    public function testExtract($template, $messages)
    {
        $extractor = new HandleBarsExtractor('');
        $extractor->setPrefix('prefix');
        $catalogue = new MessageCatalogue('en');

        $m = new \ReflectionMethod($extractor, 'extractTemplate');
        $m->setAccessible(true);
        $m->invoke($extractor, $template, $catalogue);

        foreach ($messages as $key => $domain) {
            $this->assertTrue($catalogue->has($key, $domain));
            $this->assertEquals('prefix' . $key, $catalogue->get($key, $domain));
        }
    }

    public function getExtractData()
    {
        return array(
            array("{{ translate 'new key' 'domain' }}", array('new key' => 'domain')),
            array("{{translate 'new key' 'domain'}}", array('new key' => 'domain')),
            array("{{   translate 'new key' 'domain'}}", array('new key' => 'domain')),
            array("{{translate      'new key' 'domain'}}", array('new key' => 'domain')),
            array("{{translate 'new key'     'domain'}}", array('new key' => 'domain')),
            array("{{translate 'new key' 'domain'     }}", array('new key' => 'domain')),

            //double quote
            array('{{translate "new key" "domain" }}', array('new key' => 'domain')),
            array("{{translate \"new' key\" \"domain\" }}", array("new' key" => 'domain')),
            array("{{translate \"new key\" 'domain' }}", array('new key' => 'domain')),

            //with variables
            array("{{ translate 'new \" key' 'variables' 'domain' }}", array('new " key' => 'domain')),
            array("{{ translate 'new key'       'variables' 'domain' }}", array('new key' => 'domain')),
            array("{{ translate 'new key' 'variables'             'domain' }}", array('new key' => 'domain')),
            array('{{ translate "new key" "variables" "domain" }}', array('new key' => 'domain')),
            array("{{ translate \"new key\" 'variables' \"domain\" }}", array('new key' => 'domain')),
        );
    }

    /**
     * @dataProvider resourceProvider
     */
    public function testExtractWithFiles($resource)
    {
        $extractor = new HandleBarsExtractor($resource);
        $catalogue = new MessageCatalogue('en');
        $extractor->extract('/tmp/whatever', $catalogue);

        $this->assertTrue($catalogue->has('test.translation.title', 'testdomain'));
        $this->assertEquals(
            'test.translation.title',
            $catalogue->get('test.translation.title', 'testdomain')
        );
    }

    /**
     * @return array
     */
    public function resourceProvider()
    {
        $directory = __DIR__ . '/../fixtures/extractor/';

        return array(
            array($directory . 'with_translations.hbt'),
        );
    }
}
