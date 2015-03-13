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
use EzSystems\PlatformUIBundle\Features\Helper\JavaScript as JsHelper;
use Behat\Gherkin\Node\TableNode;
use PHPUnit_Framework_Assert as Assertion;

class PlatformUI extends Context
{
    use SubContext\Authentication;
    use SubContext\CommonActions;

    /**
     * PlatformUI relative URL path
     *
     * @var string
     */
    private $platformUiUri;

    /**
     * WebDriver in use
     * Only Sahi or Selenium2 accepted
     *
     * @var string
     */
    protected $driver;

    /**
     * Evaluate javascript code and return result.
     *
     * @param   string  $jsCode
     * @return  mixed
     */
    protected function evalJavascript( $jsCode, $addJsHelper = true )
    {
        if ( $addJsHelper )
        {
            $jsCode = JsHelper::getHelperJs() . $jsCode;
        }
        $jsCode = $this->driver->wrappedFunction( $jsCode );

        return $this->getSession()->evaluateScript( $jsCode );
    }

    /**
     * Execute javascript code and return result.
     *
     * @param   string  $jsCode
     * @return  mixed
     */
    protected function execJavascript( $jsCode, $addJsHelper = true )
    {
        if ( $addJsHelper )
        {
            $jsCode = JsHelper::getHelperJs() . $jsCode;
        }

        $jsCode = $this->driver->wrappedFunction( $jsCode );

        return $this->getSession()->executeScript( $jsCode );
    }

    /**
     * Waits for Javascript to finnish by running a empty Javascript
     * (In Sahi it's possible to have the same result by running an empty javascript only)
     */
    protected function waitForLastJs()
    {
        //Needs to be here
        $this->execJavascript( '' );

        $jsCode = "return BDD.isSomethingLoading();";

        while ( $this->evalJavascript( $jsCode ) )
        {
            usleep( 100 * 1000 ); // 100ms
        }
    }

    /**
     * Waits for Javascript to finnish by running a empty Javascript
     * (In Sahi it's possible to have the same result by running an empty javascript only)
     */
    protected function activateJsErrorHandler()
    {
        //Needs to be here
        //$this->execJavascript( '' );
        $jsCode = "return BDD.errorHandlerActivate();";
        $this->execJavascript( $jsCode );
    }

    /**
     * @Given I create a content of content type :type with:
     */
    public function iCreateContentType( $type, TableNode $fields )
    {
        $this->clickNavigationZone( "Platform" );
        $this->waitForJs();
        $this->iClickAtLink( "Content structure" );
        $this->waitForJs();
        $this->clickActionBar( "Create a content" );
        $this->waitForJs();
        $this->clickContentType( $type );
        $this->waitForJs();
        foreach ( $fields as $fieldArray )
        {
            $keys = array_keys( $fieldArray );
            for ( $i = 0; $i < count( $keys ); $i++ )
            {
                $this->fillFieldWithValue( $keys[$i], $fieldArray[$keys[$i]] );
            }
        }
    }

    /**
     * @Then I see Content :contentName of type :contentType
     */
    public function contentExists( $contentName, $contentType )
    {
        $contentId = $this->getLocationId();
        $content = $this->getContentManager()->loadContentWithLocationId( $contentId );
        $contentInfo = $content->contentInfo;
        $contentTypeName = $this->getContentManager()->getContentType( $content );
        Assertion::assertEquals( $contentName, $contentInfo->name, "Content has wrong name" );
        Assertion::assertEquals( $contentType, $contentTypeName, "Content has wrong type" );
    }

    /**
     * @Given I fill in :field subform with:
     */
    public function fillSubForm( $field, TableNode $values )
    {
        $valuesInArray = array();
        foreach ( $values as $value )
        {
            foreach ( array_keys( $value ) as $key )
            {
                $valuesInArray[$key][] = $value[$key];
            }
        }
        $valuesInArray['size'] = count( array_keys( $valuesInArray[$key] ) );

        $mainSelector = ".ez-editfield-infos";
        $ancestorSelector = "div[class$='editview']";
        $childSelector = "input, .ez-field-sublabel";

        $jsArgs = JsHelper::generateFuncArgs( $field, $mainSelector, $valuesInArray, $ancestorSelector, $childSelector );
        $jsCode = "return BDD.fillListPair( $jsArgs )";
        $this->execJavascript( $jsCode );
    }

    /**
     * @Given I upload the image :path
     * @Given I upload the file :path
     */
    public function iUploadTheImage( $path )
    {
        $this->attachFilePrepare( $path, '.ez-binarybase-input-file' );
    }

    /**
     * @Given I drag and drop a file :file to upload
     */
    public function iDragAndDropFile( $path )
    {
        $this->dragAndDropFile( $path, 'ez-button-upload' );
    }

    /**
     * @Then I should see the following elements:
     */
    public function iSeeElementsVisible( TableNode $elements )
    {
        foreach ( $elements as $element )
        {
            $name = array_values( $element )[0];
            $isVisible = $this->isElementVisible( $name, '.ez-zone-name, .ez-navigation-item' );
            Assertion::assertTrue( $isVisible, "Element $name not found" );
        }
    }

    /**
     * @Then I shouldn't see the following elements:
     * @Then I should not see the following elements:
     */
    public function iSeeElementsNotVisible( TableNode $elements )
    {
        foreach ( $elements as $element )
        {
            $name = array_values( $element )[0];
            $isVisible = $this->isElementVisible( $name, '.ez-zone-name, .ez-navigation-item' );
            Assertion::assertFalse( $isVisible, "Element $name found" );
        }
    }

    /**
     * @Then I should see (an) element :element with value :value
     */
    public function iSeeElementsWithValue( $element, $value )
    {
        $valueActual = $this->checksElementSiblingValue( $element, '.ez-fieldview-label' );
        //check later
        Assertion::assertEquals( preg_replace( '/\s+/', '', $value ), preg_replace( '/\s+/', '', $valueActual ) );
    }

    /**
     * @Then I should see (an) element :element with (an) image
     */
    public function iSeeElementImage( $element )
    {
        //Temporary solution ONLY
        sleep( 2 );
        $imgUrl = $this->checksImagePresent( $element, '.ez-fieldview-label' );
        $isImage = exif_imagetype( $imgUrl );
        Assertion::assertNotFalse( $isImage, "Not an image" );
    }

    /**
     * @Then I should see (an) element :element with (an) file :file
     */
    public function iSeeElementFile( $element, $file )
    {
        $url = $this->getFileUrl( $element, '.ez-fieldview-label' );
        $fileContentActual = file_get_contents( $url );
        $file = rtrim( realpath( $this->getMinkParameter( 'files_path' ) ), DIRECTORY_SEPARATOR ).DIRECTORY_SEPARATOR.$file;
        $fileContentExpected = file_get_contents( $file );
        Assertion::assertEquals( $fileContentActual, $fileContentExpected );
    }

    /**
     * @Then I should see elements with the following names:
     */
    public function iSeeElements( TableNode $elements )
    {
        foreach ( $elements as $element )
        {
            $found = false;
            $name = array_values( $element )[0];
            $found = $this->checksElementByText( $name, '.ez-selection-filter-item' );
            Assertion::assertNotNull( $found, "Element: $name not found" );
        }
    }

    /**
     * Runs a empty Javascript between step so that the next step is only executed when the previous Javascript finnished
     *
     * @AfterStep
     */
    public function waitForJs()
    {
        $this->waitForLastJs();
    }

    /**
     * Initialize class
     *
     * @param string $uri
     */
    public function __construct( $uri, $driver )
    {
        parent::__construct();
        $this->platformUiUri = $uri;
        $driver = "EzSystems\PlatformUIBundle\Features\DriverJS\\" . $driver;
        $this->driver = new $driver;
    }

    /**
     * Finds an HTML element by class and the text value and return the value of the sibling
     *
     * @param   string  $text       Text value of the element
     * @param   string  $selector   CSS selector of the element
     * @return  array
     */
    protected function checksElementSiblingValue( $text, $selector )
    {
        $jsArgs = JsHelper::generateFuncArgs( $text, $selector );
        $jsCode = "return BDD.checksElementSiblingValueByText( $jsArgs );";
        return $this->evalJavascript( $jsCode );
    }

    /**
     * Makes and element visible so a file can be attached to it
     *
     * @param   string  $path      file path relative to mink definitions
     * @param   string  $selector  selector of the element do to make visible
     */
    protected function attachFilePrepare( $path, $selector )
    {
        $jsArgs = JsHelper::generateFuncArgs( $selector );
        $jsCode = "return BDD.changeCssDisplay( $jsArgs );";
        $this->execJavascript( $jsCode );

        $this->attachFile( $path, $selector );
    }

    /**
     * Attaches a file to a input field on the HTML
     *
     * @param   string  $file       file name relative to mink definitions
     * @param   string $selector    CSS file upload element selector
     */
    protected function attachFile( $fileName, $selector )
    {
        if ( $this->getMinkParameter( 'files_path' ) )
        {
            $fullPath = rtrim( realpath( $this->getMinkParameter( 'files_path' ) ), DIRECTORY_SEPARATOR ).DIRECTORY_SEPARATOR.$fileName;

            if ( is_file( $fullPath ) )
            {
                $fileInput = 'input[type="file"]' . $selector;
                $field = $this->getSession()->getPage()->find( 'css', $fileInput );

                if ( null === $field )
                {
                    throw new Exception( "File input $selector is not found" );
                }
                $field->attachFile( $fullPath );
            }
        }
        else
        {
            throw new Exception( "File $fileName is not found at the given location: $fullPath" );
        }
    }

    /**
     * Drops a file to an HTML element with specific text
     *
     * @param   string  $path      file path relative to mink definitions
     * @param   string  $selector  selector of the element where to drop the file
     */
    protected function dragAndDropFile( $fileName, $selector )
    {
        if ( $this->getMinkParameter( 'files_path' ) )
        {
            $fullPath = rtrim( realpath( $this->getMinkParameter( 'files_path' ) ), DIRECTORY_SEPARATOR ).DIRECTORY_SEPARATOR.$fileName;

            if ( is_file( $fullPath ) )
            {
                $finfo = finfo_open( FILEINFO_MIME_TYPE );
                $fileType = finfo_file( $finfo, $fullPath );
                $contents = file_get_contents( $fullPath );
                $contentBase64 = base64_encode( $contents );

                $jsArgs = JsHelper::generateFuncArgs( $file, $fileType, $contentBase64, $selector );
                $jsCode = "return BDD.simulateDropEventWithFile( $jsArgs );";
                $jsFile = $this->execJavascript( $jsCode );
            }
        }
        else
        {
                throw new Exception( "File $fileName is not found at the given location: $fullPath" );
        }
    }

    /**
     * Verifies the visibility of an HTML element
     *
     * @param   string  $text       Text value of the element
     * @param   string  $selector   CSS selector of the element
     * @return  boolean
     */
    protected function isElementVisible( $text, $selector )
    {
        $jsArgs = JsHelper::generateFuncArgs( $text, $selector );
        $jsCode = "return BDD.checkVisibility( $jsArgs );";
        $visibility = $this->evalJavascript( $jsCode );

        return $visibility;
    }

    /**
     * Finds an Image element with a label
     *
     * @param   string  $imageLabel image label text
     * @param   string  $selector   image css selector
     */
    protected function checksImagePresent( $imageLabel, $selector )
    {
        $jsArgs = JsHelper::generateFuncArgs( $imageLabel, $selector );
        $jsCode = "return BDD.getImgSrc( $jsArgs );";
        return $this->evalJavascript( $jsCode );
    }

    /**
     * Finds an file URL link with a label
     *
     * @param   string  $fileLabel  file label text
     * @param   string  $selector   file css selector
     */
    protected function getFileUrl( $fileLabel, $selector )
    {
        $jsArgs = JsHelper::generateFuncArgs( $fileLabel, $selector );
        $jsCode = "return BDD.getLinkUrl( $jsArgs );";
        return $this->evalJavascript( $jsCode );
    }

    /**
     * Get the Location Id of the location on the display in the corrent browser window
     *
     * @return string
     */
    protected function getLocationId()
    {
        $jsCode = "return BDD.getWindowHash();";
        $hash = $this->evalJavascript( $jsCode );
        $hash = explode( '/', $hash );
        $lastElement = end( $hash );
        return $lastElement;
    }
}
