<?php
/**
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle\Tests\ApplicationConfig\Providers;

use eZ\Publish\API\Repository\Values\Content\Language;
use EzSystems\PlatformUIBundle\ApplicationConfig\Providers\Languages;
use PHPUnit_Framework_TestCase;

class LanguagesTest extends PHPUnit_Framework_TestCase
{
    private $languageData = [
        'id' => 44,
        'name' => 'English (UK)',
        'languageCode' => 'eng-GB',
        'enabled' => false,
    ];

    private $prioritizedLanguages = [
        'eng-GB',
    ];

    public function testGetConfig()
    {
        $provider = new Languages($this->getLanguageServiceMock(), $this->prioritizedLanguages);
        $expected = [$this->languageData + ['default' => true]];
        self::assertEquals(
            $expected,
            $provider->getConfig()
        );
    }

    private function getLanguageServiceMock()
    {
        $mock = $this->getMock('\eZ\Publish\API\Repository\LanguageService');
        $mock
            ->expects($this->once())
            ->method('loadLanguages')
            ->with()
            ->will($this->returnValue([new Language($this->languageData)]));

        return $mock;
    }
}
