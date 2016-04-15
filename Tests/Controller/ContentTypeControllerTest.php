<?php

/**
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle\Tests\Controller;

use eZ\Publish\API\Repository\Values\Content\Language;
use EzSystems\PlatformUIBundle\Controller\ContentTypeController;
use PHPUnit_Framework_TestCase;

class ContentTypeControllerTest extends PHPUnit_Framework_TestCase
{
    /** @var \eZ\Publish\API\Repository\ContentTypeService|\PHPUnit_Framework_MockObject_MockObject */
    private $contentTypeService;

    /** @var \eZ\Publish\API\Repository\SearchService|\PHPUnit_Framework_MockObject_MockObject */
    private $searchService;

    /** @var \eZ\Publish\API\Repository\UserService|\PHPUnit_Framework_MockObject_MockObject */
    private $userService;

    /** @var \EzSystems\RepositoryForms\Form\ActionDispatcher\ActionDispatcherInterface|\PHPUnit_Framework_MockObject_MockObject */
    private $contentTypeGroupActionDispatcher;

    /** @var \EzSystems\RepositoryForms\Form\ActionDispatcher\ActionDispatcherInterface|\PHPUnit_Framework_MockObject_MockObject */
    private $contentTypeActionDispatcher;

    /** @var \EzSystems\RepositoryForms\FieldType\FieldTypeFormMapperRegistryInterface|\PHPUnit_Framework_MockObject_MockObject */
    private $fieldTypeMapperRegistry;

    /** @var \eZ\Publish\API\Repository\LanguageService */
    private $languageService;

    protected function setUp()
    {
        parent::setUp();

        $this->contentTypeService = $this->getMock('eZ\Publish\API\Repository\ContentTypeService');
        $this->searchService = $this->getMock('eZ\Publish\API\Repository\SearchService');
        $this->userService = $this->getMock('eZ\Publish\API\Repository\UserService');
        $this->contentTypeGroupActionDispatcher = $this->getMock('EzSystems\RepositoryForms\Form\ActionDispatcher\ActionDispatcherInterface');
        $this->contentTypeActionDispatcher = $this->getMock('EzSystems\RepositoryForms\Form\ActionDispatcher\ActionDispatcherInterface');
        $this->fieldTypeMapperRegistry = $this->getMock('EzSystems\RepositoryForms\FieldType\FieldTypeFormMapperRegistryInterface');
        $this->languageService = $this->getMock('eZ\Publish\API\Repository\LanguageService');
    }

    /**
     * @return \EzSystems\PlatformUIBundle\Controller\ContentTypeController
     */
    protected function getContentTypeController()
    {
        $controller = new ContentTypeController(
            $this->contentTypeService,
            $this->searchService,
            $this->userService,
            $this->contentTypeGroupActionDispatcher,
            $this->contentTypeActionDispatcher,
            $this->fieldTypeMapperRegistry,
            $this->languageService
        );

        return $controller;
    }

    public function getPrioritizedLanguageData()
    {
        return [
            [
                ['nor-NO'],
                ['eng-GB', 'fre-FR'],
                'eng-GB',
                'eng-GB',
            ],
            [
                ['nor-NO'],
                ['eng-GB', 'fre-FR', 'nor-NO'],
                'eng-GB',
                'nor-NO',
            ],
            [
                ['eng-GB', 'fre-FR', 'nor-NO'],
                ['eng-GB', 'fre-FR'],
                'eng-GB',
                'eng-GB',
            ],
            [
                ['nor-NO', 'eng-GB', 'fre-FR'],
                ['eng-GB', 'fre-FR', 'nor-NO'],
                'eng-GB',
                'nor-NO',
            ],
            [
                ['nor-NO', 'fre-FR', 'eng-GB'],
                ['eng-GB', 'fre-FR'],
                'eng-GB',
                'fre-FR',
            ],
        ];
    }

    /**
     * @dataProvider getPrioritizedLanguageData
     * @covers \EzSystems\PlatformUIBundle\Controller\ContentTypeController::getPrioritizedLanguage()
     */
    public function testGetPrioritizedLanguage($prioritizedLanguages, $languageCodes, $fallbackLanguageCode, $expected)
    {
        $controller = $this->getContentTypeController();
        $controller->setPrioritizedLanguages($prioritizedLanguages);
        $testMethod = new \ReflectionMethod(
            '\EzSystems\PlatformUIBundle\Controller\ContentTypeController',
            'getPrioritizedLanguage'
        );
        $testMethod->setAccessible(true);

        $actual = $testMethod->invoke($controller, $languageCodes, $fallbackLanguageCode);

        $this->assertEquals($expected, $actual);
    }

    public function getEnabledRepositoryLanguageCodesData()
    {
        return [
            [[
                new Language([
                    'id' => 2,
                    'name' => 'English (United Kingdom)',
                    'languageCode' => 'eng-GB',
                    'enabled' => true,
                ]),
                new Language([
                    'id' => 3,
                    'name' => 'French (France)',
                    'languageCode' => 'fre-FR',
                    'enabled' => true,
                ]),
                new Language([
                    'id' => 4,
                    'name' => 'Norwegian (bokmål)',
                    'languageCode' => 'nor-NO',
                    'enabled' => false,
                ]),
            ]],
        ];
    }

    /**
     * @dataProvider getEnabledRepositoryLanguageCodesData
     * @covers \EzSystems\PlatformUIBundle\Controller\ContentTypeController::getEnabledRepositoryLanguageCodes()
     */
    public function testGetEnabledRepositoryLanguageCodes($repositoryLanguages)
    {
        $this->languageService
            ->expects($this->once())
            ->method('loadLanguages')
            ->will($this->returnValue($repositoryLanguages));

        $controller = $this->getContentTypeController();
        $testMethod = new \ReflectionMethod(
            '\EzSystems\PlatformUIBundle\Controller\ContentTypeController',
            'getEnabledRepositoryLanguageCodes'
        );
        $testMethod->setAccessible(true);

        $actual = $testMethod->invoke($controller);

        $this->assertEquals(
            ['eng-GB', 'fre-FR'],
            $actual
        );
    }
}
