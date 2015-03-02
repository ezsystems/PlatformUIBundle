Feature: Login on PlatformUI

    @javascript
    Scenario: As a admin User, I want to login to PlatformUI
        Given I go to PlatformUI app
        And I fill in "Username" with "admin"
        And I fill in "Password" with "publish"
        When I click on the "Login" button
        Then I should see "Welcome to eZ Platform" title

    @javascript
    Scenario: As a admin User, I want to login to PlatformUI
        Given I go to PlatformUI app with username "admin" and password "publish"
        Then I should see "Welcome to eZ Platform" title

    @javascript
    Scenario: As a admin User, I want to see Activity tab
        Given I go to PlatformUI app with username "admin" and password "publish"
        And I click on "Root location" link
        When I click on the tab "Activity"
        Then I should see "Activity content" text

    @javascript
    Scenario: As a admin User, I want to use side menu
        Given I go to PlatformUI app with username "admin" and password "publish"
        And I click on "Root location" link
        When I click on the logo
        Then I should see "Welcome to eZ Platform" title

    @javascript
    Scenario: As a admin User, I want to see navigate menu
        Given I go to PlatformUI app with username "admin" and password "publish"
        And I click on the menu zone "Create"
        When I clicked on the "Media library" link
        Then I should see "Media" title

    @javascript
    Scenario: As a admin User, I want to see navigate menu
        Given I go to PlatformUI app with username "admin" and password "publish"
        And I click on the menu zone "Deliver"
        When I click on the menu zone "Create"
        And I clicked on the "Media library" link
        Then I should see "Media" title

    @javascript
    Scenario: As a admin User, I want to see navigate menu
        Given I go to PlatformUI app with username "admin" and password "publish"
        And I click on the menu link "Administration"
        Then I should see "Administration dashboard" title

    @javascript
    Scenario: As a admin User, I want to see navigate menu
        Given I go to PlatformUI app with username "admin" and password "publish"
        And I click on the menu zone "Create"
        When I click on the sub-menu option "Insite editing"
        Then I should see "Site 1" text

    @javascript
    Scenario: As a admin User, I want to see side menu
        Given I go to PlatformUI app with username "admin" and password "publish"
        And I click on the menu zone "Create"
        And I click on the "Content structure" link
        And I click on the side menu option "Content tree"
        When I click on the "footer" link
        Then I should see "footer" title

    @javascript
    Scenario: As a admin User, I want to use side menu
        Given I go to PlatformUI app with username "admin" and password "publish"
        And I click on the menu zone "Create"
        And I click on the "Content structure" link
        When I click on the side menu option "Create a content"
        And I click on the content type "Article"
        And I fill in "Title*" with "Test"
        And I fill in "Summary" with "TestSum"
        Then I should see "Short title" text

    @javascript
    Scenario: As a admin User, I want to use side menu
        Given I go to PlatformUI app with username "admin" and password "publish"
        And I click on the menu zone "Create"
        And I click on the "Content structure" link
        When I click on the side menu option "Edit"
        And I click on the side menu option "Discard changes"
        Then I should see "Home" title

    @javascript
    Scenario: As a admin User, I want to use side menu
        Given I go to PlatformUI app with username "admin" and password "publish"
        And I click on the menu zone "Create"
        And I click on the "Content structure" link
        When I click on the side menu option "Minimize"
        Then I don't see "Minimize" text

    @javascript
    Scenario: As a admin User, I want to use side menu
        Given I go to PlatformUI app with username "admin" and password "publish"
        And I click on the menu zone "Create"
        And I click on the "Content structure" link
        And I click on the side menu option "Content tree"
        When I click on the content tree with path "Shopping/Produtcs/eZ Publish - Man jacket"
        Then I should see "Price" text

    @javascript
    Scenario: As a admin User, I want to use side menu
        Given I go to PlatformUI app with username "admin" and password "publish"
        And I click on the menu zone "Create"
        And I click on the "Content structure" link
        And I click on the side menu option "Content tree"
        And I click on the "footer" link
        And I click on the logo
        And I click on the menu zone "Deliver"
        And I click on the menu zone "Optimize"
        And I click on the menu zone "Create"
        And I click on the sub-menu option "Insite editing"
        And I click on the "Content structure" link
        And I click on the "Media library" link
        And I click on the "Campaign" link
        And I click on the sub-menu option "More"
        And I click on the menu link "Administration"
        And I click on the logo
        And I click on "Root location" link
        And I click on the tab "Details"
        And I click on the tab "Activity"
        And I click on the tab "Analytic"
        And I click on the tab "View"
        And I click on the side menu option "Create a content"
        And I click on the content type "Article"
        And I fill in "Title*" with "Bacalhau"
        And I fill in "Summary" with "Ze manel"
        And I click on the side menu option "Discard changes"
        And I click on the side menu option "Minimize"
        And I click on the side menu option "Minimize"
        And I logout
        Then I should see "Reset password" text
