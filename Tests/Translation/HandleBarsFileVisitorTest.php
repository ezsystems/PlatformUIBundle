<?php

/**
 * File containing the HandleBarsExtractorTest class.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle\Tests\Translation;

use EzSystems\PlatformUIBundle\Translation\HandleBarsFileVisitor;
use JMS\TranslationBundle\Model\Message;
use JMS\TranslationBundle\Model\MessageCatalogue;
use SplFileInfo;

class HandleBarsFileVisitorTest extends \PHPUnit_Framework_TestCase
{
    /**
     * @dataProvider getExtractData
     */
    public function testExtract($templateContent, array $expectedMessages)
    {
        $visitor = new HandleBarsFileVisitor();
        $catalogue = new MessageCatalogue('en');

        $m = new \ReflectionMethod($visitor, 'extractTemplate');
        $m->setAccessible(true);
        $messages = $m->invoke($visitor, $templateContent, $catalogue);

        foreach ($expectedMessages as $key => $domain) {
            $this->assertTrue(
                in_array(new Message($key, $domain), $messages),
                "The key '$key' should be defined in the domain '$domain'"
            );
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
            array("{{\ttranslate 'new key' 'domain'  \t\t   }}", array('new key' => 'domain')),
            array("{{translate 'new key'\t\t'domain' }}", array('new key' => 'domain')),
            array("{{translate\t\t\t'new key'    'domain' }}", array('new key' => 'domain')),

            //double quote
            array('{{translate "new key" "domain" }}', array('new key' => 'domain')),
            array("{{translate \"new' key\" \"domain\" }}", array("new' key" => 'domain')),
            array("{{translate \"new key\" 'domain' }}", array('new key' => 'domain')),

            //with variables
            array("{{ translate 'new \" key' 'domain' variable=var foo=bar }}", array('new " key' => 'domain')),
            array("{{ translate 'new key' 'domain'            variable=var foo=bar }}", array('new key' => 'domain')),
            array("{{ translate 'new key' 'domain'\t\tvariable=var foo=bar }}", array('new key' => 'domain')),
            array("{{ translate 'new key' 'domain' variable=var foo=bar         \t}}", array('new key' => 'domain')),
            array('{{ translate "new key" "domain" variable="var" foo=\'bar\' }}', array('new key' => 'domain')),
            array('{{ translate "new key" "domain" variable="var" foo="bar" }}', array('new key' => 'domain')),
            array("{{ translate \"new key\" \"domain\" variable='var' foo=\"bar\" }}", array('new key' => 'domain')),

            //variable as translation string
            array("{{ translate fieldGroupName 'ezplatform_fields_groups' }}", array()),
        );
    }

    /**
     * @dataProvider resourceProvider
     */
    public function testExtractWithFiles($resource)
    {
        $visitor = new HandleBarsFileVisitor();
        $catalogue = new MessageCatalogue('en');
        $visitor->visitFile($resource, $catalogue);

        $this->assertTrue($catalogue->has(new Message('test.translation.title', 'testdomain')));
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
        return [[new SplFileInfo(__DIR__ . '/../fixtures/extractor/Resources/public/templates/with_translations.hbt')]];
    }
}
