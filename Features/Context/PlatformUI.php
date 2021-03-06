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

class PlatformUI extends Context
{
    /**
     * Default Platform URI.
     */
    const PLATFORM_URI = 'ez';

    /**
     * Max. time to wait while loading elements (f.e. during rest calls).
     */
    const MAX_WAIT_TIMEOUT = 60;

    /**
     * Max. time to use when trying to access html DOM elements (seconds).
     */
    const SPIN_TIMEOUT = 10;

    /**
     * sleep time interval, in ms.
     */
    const WAIT_SLEEP_TIME_MS = 250;

    /**
     * default content "loading" class selector.
     */
    const LOADING_SELECTOR = '.is-app-loading, .is-app-transitioning, .yui3-app-transitioning';

    /**
     * Constants used for the delayed publishing mechanism.
     */
    const NOT_WAITING = 0;
    const WAITING_FOR_PUBLISHING = 1;

    use SubContext\Authentication;
    use SubContext\CommonActions;

    /**
     * PlatformUI relative URL path.
     *
     * @var string
     */
    protected $platformUiUri;

    /**
     * Last exception thrown in spin method.
     */
    protected $lastException;

    /**
     * User account name, admin by default.
     *
     * @var string
     */
    protected $user = 'admin';

    /**
     * User account password, publish by default.
     *
     * @var string
     */
    protected $password = 'publish';

    /**
     * Stores the status of the platform.
     * @var int
     */
    protected $platformStatus = self::NOT_WAITING;

    /**
     * Mapping of the new paths of contents after being moved.
     */
    protected $newPathsMap = array();

    /**
     * Initialize class.
     *
     * @param string $uri
     */
    public function __construct($uri = self::PLATFORM_URI, $user = null, $password = null)
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
     * @BeforeScenario
     */
    public function beforeScenario()
    {
        $this->getSession()->getDriver()->maximizeWindow();
    }

    /**
     * @AfterScenario
     */
    public function afterScenario()
    {
        $this->closeConfirmBox();
        $this->closeEditView();

        // Only logout if the scenario logged the user in (otherwise this will fail, for instance on skipped scenarios)
        if ($this->shouldBeLoggedIn) {
            $this->iLogout();
        }
    }

    /**
     * @BeforeStep
     */
    public function beforeStep()
    {
        $this->sleep();
        $this->waitWhileLoading();
    }

    /**
     * @AfterStep
     */
    public function afterStep()
    {
    }

    /**
     * Setter for the new path of the content name.
     */
    protected function mapContentPath($name, $path)
    {
        $this->newPathsMap[$name] = $path;
    }

    /**
     * Getter for the maped path to the content name.
     */
    protected function getContentPath($name)
    {
        return $this->newPathsMap[$name];
    }

    /**
     * Wait (sleep) for the defined time, in ms.
     */
    protected function sleep()
    {
        usleep(self::WAIT_SLEEP_TIME_MS * 1000);
    }

    /**
     * Wait while 'app loading' elements (such as spinner) exist
     *  for example, while opening and publishing contents, etc...
     *
     * @param $selector selector to match,
     */
    public function waitWhileLoading($selector = self::LOADING_SELECTOR, $onlyVisible = true)
    {
        $maxTime = time() + self::MAX_WAIT_TIMEOUT;
        do {
            $this->sleep();
            $elem = $this->getSession()->getPage()->find('css', $selector);
            if ($elem && $onlyVisible) {
                try {
                    $isVisible = $elem->isVisible();
                } catch (\Exception $e) {
                    // elem no longer present, assume not visible
                    $elem = null;
                }
            }
            $done = $elem == null || ($onlyVisible && !$isVisible);
        } while (!$done && time() < $maxTime);
        if (!$done) {
            throw new \Exception("Timeout while waiting for loading element '$selector'.");
        }
    }

    /**
     * Behat spin function
     *  Execute a provided function and return it's result if valid,
     *  if an exception is thrown or the result is false wait and retry
     *  until a max timeout is reached.
     */
    public function spin($lambda)
    {
        $e = null;
        $timeLimit = time() + self::SPIN_TIMEOUT;
        do {
            try {
                $return = $lambda($this);
                if ($return) {
                    return $return;
                }
            } catch (\Exception $e) {
            }

            $this->sleep();
        } while ($timeLimit > time());

        throw new \Exception(
            'Timeout while retreaving DOM element' .
            ($e !== null ? '. Last exception: ' . $e->getMessage() : '')
        );
    }

    /**
     * Adpted Mink find function combined with a spin function
     * to find all element with a given css selector that might still be loading.
     *
     * @param   string      $locator        css selector for the element
     * @param   NodeElement $baseElement    base Mink node element from where the find should be called
     * @return  NodeElement[]
     */
    public function findAllWithWait($locator, $baseElement = null)
    {
        if (!$baseElement) {
            $baseElement = $this->getSession()->getPage();
        }
        $elements = $this->spin(
            function () use ($locator, $baseElement) {
                $elements = $baseElement->findAll('css', $locator);
                foreach ($elements as $element) {
                    // An exception may be thrown if the element is not valid/attached to DOM.
                    $element->getValue();
                }

                return $elements;
            }
        );

        return $elements;
    }

    /**
     * Adpted Mink find function combined with a spin function
     * to find one element that might still be loading.
     *
     * @param   string      $selector       css selector for the element
     * @param   \Behat\Mink\Element\NodeElement $baseElement    base Mink node element from where the find should be called
     *
     * @return  \Behat\Mink\Element\NodeElement
     */
    public function findWithWait($selector, $baseElement = null, $checkVisibility = true)
    {
        if (!$baseElement) {
            $baseElement = $this->getSession()->getPage();
        }
        $element = $this->spin(
            function () use ($selector, $baseElement, $checkVisibility) {
                $element = $baseElement->find('css', $selector);
                if (!$element) {
                    throw new \Exception("Element with selector '$selector' was not found");
                }
                // An exception may be thrown if the element is not valid/attached to DOM.
                $element->getValue();

                if ($checkVisibility && !$element->isVisible()) {
                    throw new \Exception("Element with selector '$selector' is not visible");
                }

                return $element;
            }
        );

        return $element;
    }

    /**
     * Finds an HTML element by class and the text value and returns it.
     *
     * @param string    $text           Text value of the element
     * @param string    $selector       CSS selector of the element
     * @param string    $textSelector   Extra CSS selector for text of the element
     * @param string    $baseElement    Element in which the search is based
     * @param int       $iteration      Iteration number, used to control number of executions
     * @return array
     */
    public function getElementByText($text, $selector, $textSelector = null, $baseElement = null)
    {
        if ($baseElement == null) {
            $baseElement = $this->getSession()->getPage();
        }
        $elements = $this->findAllWithWait($selector, $baseElement);
        foreach ($elements as $element) {
            if ($textSelector != null) {
                try {
                    $elementText = $this->findWithWait($textSelector, $element)->getText();
                } catch (\Exception $e) {
                    continue;
                }
            } else {
                $elementText = $element->getText();
            }
            if ($elementText == $text) {
                return $element;
            }
        }

        return false;
    }

    /**
     * Finds an HTML element by class and the text value and clicks it.
     *
     * @param string    $text           Text value of the element
     * @param string    $selector       CSS selector of the element
     * @param string    $textSelector   Extra CSS selector for text of the element
     * @param string    $baseElement    Element in which the search is based
     */
    public function clickElementByText($text, $selector, $textSelector = null, $baseElement = null)
    {
        $element = $this->getElementByText($text, $selector, $textSelector, $baseElement);
        if ($element && $element->isVisible()) {
            $element->click();
        } elseif ($element) {
            throw new \Exception("Can't click '$text' element: not visible");
        } else {
            throw new \Exception("Can't click '$text' element: not Found");
        }
    }

    /**
     * Clicks a content browser node based on the root of the browser or a given node.
     *
     * @param   string          $text   The text of the node that is going to be clicked
     * @param   NodeElement     $parentNode       The base node to expand from, if null defaults to the content browser root
     * @throws  \Exception                  When not found
     */
    protected function openFinderExplorerNode($text, $parentNode)
    {
        $this->waitWhileLoading('.ez-ud-finder-explorerlevel-loading');

        $parentNode = $this->findWithWait('.ez-view-universaldiscoveryfinderexplorerlevelview:last-child', $parentNode);

        $element = $this->getElementByText($text, '.ez-explorer-level-list-item', '.ez-explorer-level-item', $parentNode);
        if (!$element) {
            throw new \Exception("The browser node '$text' was not found");
        }

        $element->click();
    }

    /**
     * Explores the content browser expanding it.
     *
     * @param   string       $path    The content browser path such as 'Content1/Content2/ContentIWantToClick'
     * @param   NodeElement  $node    The base node to expand from
     */
    public function openFinderExplorerPath($path, $node)
    {
        $path = explode('/', $path);
        foreach ($path as $nodeName) {
            $this->openFinderExplorerNode($nodeName, $node);
        }
    }

    /**
     * Explores the UDW, expanding it and click on the desired element.
     *
     * @param string $path The content browse path such as 'Content1/Content2/ContentIWantToClick'
     */
    public function clickOnBrowsePath($path)
    {
        $this->clickDiscoveryBar('Content browse');
        $this->waitWhileLoading('.is-universaldiscovery-hidden');
        $node = $this->findWithWait('.ez-view-universaldiscoveryview');
        $node = $this->findWithWait('.ez-view-universaldiscoveryfinderview .ez-ud-finder-explorerlevel', $node);

        $this->openFinderExplorerPath($path, $node);
    }

    /**
     * Explores the UDW, to find the desired element.
     *
     * @param   string  $path    The content browse path such as 'Content1/Content2/ContentIWantToClick'
     */
    public function dontSeeBrowsePath($path)
    {
        $found = true;
        try {
            $this->clickOnBrowsePath($path);
        } catch (\Exception $e) {
            $found = false;
        }

        if ($found) {
            throw new \Exception("Browse path '$path' was found");
        }

        return true;
    }

    /**
     * @When I confirm the selection
     * Confirm selection in Universal discovery.
     */
    public function confirmSelection()
    {
        $elem = $this->findWithWait('.ez-view-universaldiscoveryview');
        $elem->find('css', '.ez-universaldiscovery-confirm')->click();
    }

    /**
     * @When I cancel the selection
     * Cancel the selection in Universal discovery.
     */
    public function cancelSelection()
    {
        $elem = $this->findWithWait('.ez-view-universaldiscoveryview');
        $elem->find('css', '.ez-universaldiscovery-cancel')->click();
    }

    /**
     * Close the "Confirm" modal dialog, if it is visible.
     */
    protected function closeConfirmBox()
    {
        try {
            $elem = $this->getSession()->getPage()->find('css', '.ez-view-confirmboxview');
            if ($elem && $elem->isVisible()) {
                $elem->find('css', '.ez-confirmbox-close-icon')->click();
                $this->sleep();
            }
        } catch (\Exception $e) {
        }
    }

    /**
     * Close the Edit view, if it is open.
     */
    protected function closeEditView()
    {
        try {
            $elem = $this->getSession()->getPage()->find('css', '.ez-main-content');
            if ($elem && $elem->isVisible()) {
                $elem->find('css', '.ez-view-close')->click();
                $this->waitWhileLoading();
            }
        } catch (\Exception $e) {
        }
    }

    /**
     * Attaches a file to a input field on the HTML.
     *
     * @param   string $file        file name relative to mink definitions
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
