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
    use SubContext\CommonActions;

    /**
     * PlatformUI relative URL path
     *
     * @var string
     */
    private $platformUiUri;
    protected $shouldBeLoggedIn;
    protected $driver;

    /**
     * @Given I go to homepage
     */
    public function goToPlatformUi()
    {
        $this->visit( $this->platformUiUri );
    }

    /**
     * @Given I go to PlatformUI app with username :user and password :password
     */
    public function goToPlatformUiAndLogIn( $username, $password )
    {
        // Given I go to PlatformUI app
        $this->goToPlatformUi();
        //wait fos JS
        $this->waitForJs();
        // And I fill in "Username" with "admin"
        $this->fillFieldWithValue( 'Username', $username );
        //And I fill in "Password" with "publish"
        $this->fillFieldWithValue( 'Password', $password );
        //And I click on the "Login" button
        $this->iClickAtButton( 'Login' );
        //wait fos JS
        $this->waitForJs();
        //Then I should be logged in
        $this->iShouldBeLoggedIn();
        //Catches Js errors
        $this->activateJsErrorHandler();
    }

    /**
     * @Given I click (on) the logo
     */
    public function iClickLogo()
    {
        $this->clickLogo();
    }

    /**
     * @Given I click (on) the tab :tab
     */
    public function iClickTab( $tab )
    {
        $this->clickTab( $tab );
    }

    /**
     * @Given I click (on) the navigation zone :zone
     */
    public function iClickNavigationZone( $zone )
    {
        $this->clickNavigationZone( $zone );
    }

    /**
     * @Given I over (on) the navigation zone :zone
     */
    public function iOverNavigationZone( $zone )
    {
        $this->overNavigationZone( $zone );
    }

    /**
     * @Given I click (on) the navigation item :subMenu
     */
    public function iClickNavigationItem( $subMenu )
    {
        $this->clickNavigationItem( $subMenu );
    }

    /**
     * @Given I click (on) the actionbar action :action
     */
    public function iclickActionBar( $action )
    {
        $this->clickActionBarAction( $action );
    }

    /**
     * @Given I click (on) the content type :contentType
     */
    public function iclickContentTypeOption( $contentType )
    {
        $this->clickContentType( $contentType );
    }

    /**
     * @Given I click (on) the content tree with path :path
     */
    public function iClickContentTreePath( $path )
    {
        $this->clickContentTreeLink( $path );
    }

    /**
     * @Given I fill in :field subform with:
     */
    public function iFillSubForm( $field, TableNode $values )
    {
        $arrayValues = array();
        foreach ( $values as $value )
        {
            foreach ( array_keys( $value ) as $key )
            {
                $arrayValues[$key][] = $value[$key];
            }
        }
        $arrayValues['size'] = count( array_keys( $arrayValues[$key] ) );
        $this->fillSubFormList( $field, $arrayValues );
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
     * @Given I logout
     */
    public function iLogout()
    {
        $this->shouldBeLoggedIn = false;
        $this->iClickAtLink( "Logout" );
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
     * @Then I should be logged in
     */
    public function iShouldBeLoggedIn()
    {
        $this->shouldBeLoggedIn = true;

        $jsCode = "return (document.querySelector('.ez-loginform') === null);";

        $isLoggedIn = $this->evalJavascript( $jsCode, false );
        Assertion::assertTrue( $isLoggedIn, "Not logged in" );
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
     * Runs a empty Javascript between step so that the next step is only executed when the previous Javascript finnished
     *
     * @AfterStep
     */
    public function waitForJs()
    {
        $this->waitForLastJs();
    }

    /**
     * Checks if the user is still logged in
     *
     * @AfterStep
     */
    public function runAfterStep()
    {
        if ( $this->shouldBeLoggedIn )
        {
            $this->iShouldBeLoggedIn();
        }
    }

    /**
     * Checks if the user is still logged in
     *
     * @AfterScenario
     */
    public function loggOutAfterScenario()
    {
        $this->iLogout();
    }

}
