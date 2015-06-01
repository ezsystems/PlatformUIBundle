<?php

/**
 * File containing the main context class for PlatformUI
 * This flie contains the mapping of the BDD sentences to the functions that implement them
 * Also contains the necessary initializations
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 * @version //autogentag//
 */

namespace EzSystems\PlatformUIBundle\Features\Context;

use EzSystems\BehatBundle\Context\Browser\Context;
use Behat\Gherkin\Node\TableNode;
use PHPUnit_Framework_Assert as Assertion;

class PlatformUI extends Context
{
    const NOT_WAITING = 0;
    const WAITING_FOR_PUBLISHING = 1;

    use SubContext\Authentication;
    use SubContext\CommonActions;
    use SubContext\Fields;

    /**
     * PlatformUI relative URL path
     *
     * @var string
     */
    private $platformUiUri;

    /**
     * User account name, admin by default
     *
     * @var string
     */
    private $user = "admin";

    /**
     * User account password, publish by default
     *
     * @var string
     */
    private $password = "publish";

    /**
     * Stores the status of the platform
     * @var int
     */
    private $platformStatus = self::NOT_WAITING;

    /**
     * Waits for Javascript to finish by checking the loading tags of the page
     */
    protected function waitForLoadings()
    {
        $page = $this->getSession()->getPage();
        $loadingClasses = array(
            '.yui3-app-transitioning',
            '.is-app-loading',
            '.is-app-transitioning',
            // content tree
            '.ez-view-treeactionview.is-expanded .ez-view-treeview:not(.is-tree-loaded)',
            '.is-tree-node-loading',
            // contenttype menu
            '.ez-view-createcontentactionview.is-expanded:not(.is-contenttypeselector-loaded)'
        );
        $loadingSelector = implode(',', $loadingClasses);
        while ($page->find('css', $loadingSelector) != null) {
            usleep(100 * 1000); // 100ms
        }
    }

    /**
     * @Given I create a content of content type :type with:
     */
    public function iCreateContentType($type, TableNode $fields)
    {
        $this->clickNavigationZone("Platform");
        $this->waitForLoadings();
        $this->iClickAtLink("Content structure");
        $this->waitForLoadings();
        $this->clickActionBar("Create a content");
        $this->waitForLoadings();
        $this->clickContentType($type);
        $this->waitForLoadings();
        foreach ($fields as $fieldArray) {
            $keys = array_keys($fieldArray);
            for ($i = 0; $i < count($keys); $i++) {
                $this->fillFieldWithValue($keys[$i], $fieldArray[$keys[$i]]);
            }
        }
    }

    /**
     * @Then I see Content :contentName of type :contentType
     */
    public function contentExists($contentName, $contentType)
    {
        $contentId = $this->getLocationId();
        $content = $this->getContentManager()->loadContentWithLocationId($contentId);
        $contentInfo = $content->contentInfo;
        $contentTypeName = $this->getContentManager()->getContentType($content);
        Assertion::assertEquals($contentName, $contentInfo->name, "Content has wrong name");
        Assertion::assertEquals($contentType, $contentTypeName, "Content has wrong type");
    }

    /**
     * @Then I should see (an) element :element with (an) file :file
     */
    public function iSeeElementFile($element, $file)
    {
        $url = $this->getFileUrl($element, '.ez-fieldview-label');
        $fileContentActual = file_get_contents($url);
        $file = rtrim(realpath($this->getMinkParameter('files_path')), DIRECTORY_SEPARATOR).DIRECTORY_SEPARATOR.$file;
        $fileContentExpected = file_get_contents($file);
        Assertion::assertEquals($fileContentActual, $fileContentExpected);
    }

    /**
     * @Then I should see elements with the following names:
     */
    public function iSeeElements(TableNode $elements)
    {
        foreach ($elements as $element) {
            $found = false;
            $name = array_values($element)[0];
            $found = $this->getElementByText($name, '.ez-selection-filter-item');
            Assertion::assertNotNull($found, "Element: $name not found");
        }
    }

    /**
     * Runs a empty Javascript between step so that the next step is only executed when the previous Javascript finished
     *
     * @AfterStep
     */
    public function waitForJs()
    {
        $this->waitForLoadings();
    }

    /**
     * Initialize class
     *
     * @param string $uri
     */
    public function __construct($uri, $user = null, $password = null)
    {
        parent::__construct();
        $this->platformUiUri = $uri;
        if ($user != null) {
            $this->user = $user;
        }
        if ($password != null) {
            $this->password = $password;
        }
    }

    /**
     * Checks if platform is waiting for publishing a content and if it is publishes it
     */
    private function executeDelayedActions()
    {
        if ($this->platformStatus == self::WAITING_FOR_PUBLISHING) {
            $this->clickActionBar("Publish");
        }
        $this->waitForLoadings();
    }

    /**
     * Attaches a file to a input field on the HTML
     *
     * @param   string  $file       file name relative to mink definitions
     * @param   string $selector    CSS file upload element selector
     */
    protected function attachFile($fileName, $selector)
    {
        if ($this->getMinkParameter('files_path')) {
            $fullPath = rtrim(realpath($this->getMinkParameter('files_path')), DIRECTORY_SEPARATOR).DIRECTORY_SEPARATOR.$fileName;

            if (is_file($fullPath)) {
                $fileInput = 'input[type="file"]' . $selector;
                $field = $this->getSession()->getPage()->find('css', $fileInput);

                if (null === $field) {
                    throw new Exception("File input $selector is not found");
                }
                $field->attachFile($fullPath);
            }
        } else {
            throw new Exception("File $fileName is not found at the given location: $fullPath");
        }
    }
}
