<?php

/**
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\PlatformUIBundle\Tests\Controller;

use eZ\Publish\Core\Repository\Values\ContentType\ContentType;
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

    protected function setUp()
    {
        parent::setUp();

        $this->contentTypeService = $this->getMock('eZ\Publish\API\Repository\ContentTypeService');
        $this->searchService = $this->getMock('eZ\Publish\API\Repository\SearchService');
        $this->userService = $this->getMock('eZ\Publish\API\Repository\UserService');
        $this->contentTypeGroupActionDispatcher = $this->getMock('EzSystems\RepositoryForms\Form\ActionDispatcher\ActionDispatcherInterface');
        $this->contentTypeActionDispatcher = $this->getMock('EzSystems\RepositoryForms\Form\ActionDispatcher\ActionDispatcherInterface');
        $this->fieldTypeMapperRegistry = $this->getMock('EzSystems\RepositoryForms\FieldType\FieldTypeFormMapperRegistryInterface');
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
            $this->fieldTypeMapperRegistry
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
    public function testGetPrioritizedLanguage($prioritizedLanguages, $languageCodes, $mainLanguageCode, $expected)
    {
        $controller = $this->getContentTypeController();
        $controller->setPrioritizedLanguages($prioritizedLanguages);
        $testMethod = new \ReflectionMethod(
            '\EzSystems\PlatformUIBundle\Controller\ContentTypeController',
            'getPrioritizedLanguage'
        );
        $testMethod->setAccessible(true);

        $actual = $testMethod->invoke(
            $controller,
            new ContentType([
                'names' => array_flip($languageCodes),
                'mainLanguageCode' => $mainLanguageCode,
                'fieldDefinitions' => [],
            ])
        );

        $this->assertEquals($expected, $actual);
    }
}
