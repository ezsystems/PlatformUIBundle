<?php

/**
 * This file is part of the eZ PlatformUI package.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 * @version //autogentag//
 */
namespace EzSystems\PlatformUIBundle\Features\Context;

use Behat\MinkExtension\Context\RawMinkContext;

class PlatformUI extends RawMinkContext
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
    const SPIN_TIMEOUT = 5;

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
     * Mapping of pages URL's.
     */
    protected $pageIdentifierMap = array();

    /**
     * Stores the status of the platform.
     * @var int
     */
    protected $platformStatus = self::NOT_WAITING;

    /**
     * Initialize class.
     *
     * @param string $uri
     */
    public function __construct($uri = self::PLATFORM_URI, $user = null, $password = null)
    {
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
    }

    /**
     * @BeforeStep
     */
    public function beforeStep()
    {
        $this->sleep();
        $this->waitWhileLoading();
    }

    public function fillFieldWithValue($field, $value = '')
    {
        $fieldNode = $this->spin(
            function () use ($field) {
                $fieldNode = $this->getSession()->getPage()->findField($field);
                if ($fieldNode == null) {
                    throw new \Exception('Field not found');
                }

                return $fieldNode;
            }
        );

        $this->spin(
            function () use ($fieldNode, $field, $value) {
                // make sure any autofocus elements don't mis-behave when setting value
                $fieldNode->blur();
                usleep(10 * 1000);
                $fieldNode->focus();
                usleep(10 * 1000);

                // setting value on pre-filled inputs can cause issues, clearing before
                $fieldNode->setValue('');
                $fieldNode->setValue($value);

                // verication that the field was really filled in correctly
                $this->sleep();
                $check = $this->getSession()->getPage()->findField($field)->getValue();
                if ($check != $value) {
                    throw new \Exception('Failed to set the field value: ' . $check);
                }

                return true;
            }
        );
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
    protected function waitWhileLoading($selector = self::LOADING_SELECTOR, $onlyVisible = true)
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
    protected function spin($lambda)
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
     * @param   NodeElement $baseElement    base Mink node element from where the find should be called
     * @return  NodeElement
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
     *
     * @return array
     */
    protected function getElementByText($text, $selector, $textSelector = null, $baseElement = null)
    {
        if ($baseElement == null) {
            $baseElement = $this->getSession()->getPage();
        }
        $elements = $this->findAllWithWait($selector, $baseElement);
        foreach ($elements as $element) {
            if ($textSelector != null) {
                $elementText = $this->findWithWait($textSelector, $element)->getText();
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
    protected function clickElementByText($text, $selector, $textSelector = null, $baseElement = null, $index = 1)
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
     * Opens a content tree node based on the root of the tree or a given node.
     *
     * @param   string          $text   The text of the node that is going to be opened
     * @param   NodeElement     $node       The base node to expand from, if null defaults to the content tree root
     * @return  NodeElement                 The node that was opened
     */
    protected function openTreeNode($text, $parentNode)
    {
        if ($parentNode && $parentNode->hasClass('is-tree-node-close')) {
            $toggleNode = $this->findWithWait('.ez-tree-node-toggle', $parentNode, false);
            if ($toggleNode && $toggleNode->isVisible()) {
                $toggleNode->click();
                // after expanding a node we should wait for loading to finish
                $this->sleep();
                $this->waitWhileLoading('.is-tree-node-loading');
            } else {
                $parentName = $parentNode->getText();
                throw new \Exception(
                    "The tree node '$parentName' could not be expanded: " .
                    ($toggleNode ? 'toggle not visible' : 'toggle not found')
                );
            }
        }
        // find an '.ez-tree-node' element which contains an '.ez-tree-navigate' with text '$text'
        $element = $this->getElementByText($text, '.ez-tree-node', '.ez-tree-navigate', $parentNode);
        if (!$element) {
            throw new \Exception("The tree node '$text' was not found");
        }

        return $element;
    }

    /**
     * Explores the content tree, expanding it and click on the desired element.
     *
     * @param   string       $path    The content tree path such as 'Content1/Content2/ContentIWantToClick'
     * @param   NodeElement  $node    The base node to expand from
     */
    public function openTreePath($path, $node)
    {
        $this->waitWhileLoading('.ez-tree-loading');

        $node = $this->findWithWait('.ez-view-treeview.is-tree-loaded', $node);
        $path = explode('/', $path);
        foreach ($path as $nodeName) {
            $node = $this->openTreeNode($nodeName, $node);
        }

        $this->findWithWait('.ez-tree-navigate', $node)->click();
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

    public function iSeeTitle($title)
    {
        $page = $this->getSession()->getPage();
        $this->spin(
            function () use ($title, $page) {
                $titleElements = $page->findAll('css', 'h1, h2, h3');
                foreach ($titleElements as $titleElement) {
                    $elementText = $titleElement->getText();
                    if ($elementText == $title) {
                        return $titleElement;
                    }
                }
                throw new \Exception("Title '$title' not found");
            }
        );
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
     *
     */
    {
            }
        }
    }
}
