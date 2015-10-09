<?php

/**
 * This file is part of the eZ PlatformUI package.
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
    use SubContext\Move;
    use SubContext\Copy;
    use SubContext\Remove;
    use SubContext\Role;
    use SubContext\Users;

    use Override\Override;

    /**
     * PlatformUI relative URL path.
     *
     * @var string
     */
    private $platformUiUri;

    /**
     * User account name, admin by default.
     *
     * @var string
     */
    private $user = 'admin';

    /**
     * User account password, publish by default.
     *
     * @var string
     */
    private $password = 'publish';

    /**
     * Stores the status of the platform.
     * @var int
     */
    private $platformStatus = self::NOT_WAITING;

    /**
     * Mapping of the new paths of contents after being moved.
     */
    private $newPathsMap = array();

    /**
     * Behat spin functions
     * causes waiting while a a certain function does not return true
     * waits while an element is not present.
     */
    public function spin($lambda, $wait = 30)
    {
        for ($i = 0; $i < $wait; ++$i) {
            try {
                $return = $lambda($this);
                if ($return) {
                    return $return;
                }
            } catch (\Exception $e) {
                // do nothing
            }

            usleep(100 * 3000); //100ms
        }

        $backtrace = debug_backtrace();

        throw new \Exception(
            'Timeout thrown by ' . $backtrace[1]['class'] . '::' . $backtrace[1]['function'] . '()\n' .
            $backtrace[1]['file'] . ', line ' . $backtrace[1]['line']
        );
    }

    /**
     * @Given I create a content of content type :type with:
     */
    public function iCreateContentType($type, TableNode $fields)
    {
        $this->clickNavigationZone('Platform');
        //$this->waitForLoadings();
        $this->iClickAtLink('Content structure');
        //$this->waitForLoadings();
        $this->clickActionBar('Create a content');
        //$this->waitForLoadings();
        $this->clickContentType($type);
        //$this->waitForLoadings();
        foreach ($fields as $fieldArray) {
            $keys = array_keys($fieldArray);
            for ($i = 0; $i < count($keys); ++$i) {
                $this->fillFieldWithValue($keys[$i], $fieldArray[$keys[$i]]);
            }
        }
    }

    /**
     * @Given I click (on) the content tree with path :path
     * @Then I see :path in the content tree
     * Explores the content tree, expanding it and click on the desired element
     *
     * @param   string  $path    The content tree path such as 'Content1/Content2/ContentIWantToClick'
     */
    public function clickOnTreePath($path)
    {
        $this->clickDiscoveryBar('Content tree');
        //$this->waitForLoadings();
        $node = $this->spin(
            function () {
                $page = $this->getSession()->getPage();
                $node = $page->find('css', '.ez-view-discoverybarview');
                if ($node == null) {
                    return false;
                }

                return $node;
            }
        );
        $this->openTreePath($path, $node);
    }

    /**
     * @Then I don't see :path in the content tree
     * @Then I do not see :path in the content tree
     * Explores the content tree, expanding it and click on the desired element.
     *
     * @param   string  $path    The content tree path such as 'Content1/Content2/ContentIWantToClick'
     */
    public function dontSeeTreePath($path)
    {
        $found = true;
        try {
            $this->clickOnTreePath($path);
        } catch (\Exception $e) {
            $found = false;
        }

        if ($found) {
            throw new \Exception("Tree path '$path' was found");
        }

        return true;
    }

    /**
     * @When I select the :path folder in the Universal Discovery Widget
     */
    public function selectFromUniversalDiscovery($path)
    {
        $page = $this->getSession()->getPage();
        $node = $page->find('css', '.ez-view-universaldiscoveryview');
        $this->openTreePath($path, $node);
    }

    /**
     * Confirm selection in Universal descovery.
     * @When I confirm the selection
     */
    public function confirmSelection()
    {
        $this->clickElementByText('Confirm selection', '.ez-universaldiscovery-confirm');
    }

    /**
     * @Given I am on :name full view
     */
    public function onFullView($name)
    {
        $path = $this->getBasicContentManager()->getContentPath($name);
        $this->goToContentWithPath($path);
    }

    /**
     * Opens a content in PlatformUi.
     */
    private function goToContentWithPath($path)
    {
        $this->clickNavigationZone('Content');
        //$this->waitForLoadings();
        $this->clickNavigationItem('Content structure');
        //$this->waitForLoadings();
        $this->clickOnTreePath($path);
    }

    /**
     * @Then I am on the :name location view
     */
    public function onLocationView($name)
    {
        // little info about content in platformUI,
        // for now only verifies if the title matches
        $this->iSeeTitle($name);
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
        Assertion::assertEquals($contentName, $contentInfo->name, 'Content has wrong name');
        Assertion::assertEquals($contentType, $contentTypeName, 'Content has wrong type');
    }

    /**
     * @Then I am notified that :message
     */
    public function iSeeNotification($message)
    {
        $result = $this->getElementByText($message, '.ez-notification-text');
        if (!$result) {
            throw new \Exception('The notification was not shown');
        }
    }

    /**
     * @Then I am not notified that :message
     */
    public function iDoNotSeeNotification($message)
    {
        $result = true;
        try {
            $this->iSeeNotification($message);
        } catch (\Exception $e) {
            $result = false;
        }

        if ($result) {
            throw \Exception('Notification was shown');
        }
    }

    /**
     * @Then I should see (an) element :element with (an) file :file
     */
    public function iSeeElementFile($element, $file)
    {
        $url = $this->getFileUrl($element, '.ez-fieldview-label');
        $fileContentActual = file_get_contents($url);
        $file = rtrim(
            realpath($this->getMinkParameter('files_path')),
            DIRECTORY_SEPARATOR
        ) . DIRECTORY_SEPARATOR . $file;
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
     * Initialize class.
     *
     * @param string $uri
     */
    public function __construct($uri, $user = null, $password = null)
    {
        parent::__construct();
        $this->pageIdentifierMap['roles'] = '/ez#/admin/pjax%2Frole';
        $this->pageIdentifierMap['users'] = '/ez#/view/%2Fapi%2Fezp%2Fv2%2Fcontent%2Flocations%2F1%2F5/eng-GB';
        $this->platformUiUri = $uri;
        if ($user != null) {
            $this->user = $user;
        }
        if ($password != null) {
            $this->password = $password;
        }
    }

    /**
     * Checks if platform is waiting for publishing a content and if it is publishes it.
     */
    private function executeDelayedActions()
    {
        if ($this->platformStatus == self::WAITING_FOR_PUBLISHING) {
            $this->clickEditActionBar('Publish');
        }
        //$this->waitForLoadings();
    }

    /**
     * Setter for the new path of the content name.
     */
    private function mapDestinyPath($name, $path)
    {
        $this->newPathsMap[$name] = $path;
    }

    /**
     * Getter for the maped path to the content name.
     */
    private function getDestinyPath($name)
    {
        return $this->newPathsMap[$name];
    }

    /**
     * Attaches a file to a input field on the HTML.
     *
     * @param   string  $file       file name relative to mink definitions
     * @param   string $selector    CSS file upload element selector
     */
    protected function attachFile($fileName, $selector)
    {
        if ($this->getMinkParameter('files_path')) {
            $fullPath = rtrim(
                realpath(
                    $this->getMinkParameter('files_path')
                ),
                DIRECTORY_SEPARATOR
            ) . DIRECTORY_SEPARATOR . $fileName;

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
