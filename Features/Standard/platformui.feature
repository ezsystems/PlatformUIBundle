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
        And I click on the navigation zone "Platform"
        When I clicked on the "Media library" link
        Then I should see "Media" title

    @javascript
    Scenario: As a admin User, I want to see navigate menu
        Given I go to PlatformUI app with username "admin" and password "publish"
        And I click on the navigation zone "Admin Panel"
        When I click on the navigation zone "Platform"
        And I clicked on the "Media library" link
        Then I should see "Media" title

    @javascript
    Scenario: As a admin User, I want to see navigate menu
        Given I go to PlatformUI app with username "admin" and password "publish"
        And I click on the navigation zone "Admin Panel"
        When I click on the "Administration dashboard" link
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
        And I click on the navigation zone "Platform"
        And I click on the "Content structure" link
        When I click on the actionbar action "Create a content"
        And I click on the content type "Article"
        And I fill in "Title*" with "Test"
        And I fill in "Intro" with "TestSum"
        Then I should see "Short title" text

    @javascript
    Scenario: As a admin User, I want to use side menu
        Given I go to PlatformUI app with username "admin" and password "publish"
        And I click on the navigation zone "Platform"
        And I click on the "Content structure" link
        When I click on the actionbar action "Edit"
        And I click on the actionbar action "Discard changes"
        Then I should see "eZ Publish" title

    @javascript
    Scenario: As a admin User, I want to use side menu
        Given I go to PlatformUI app with username "admin" and password "publish"
        And I click on the navigation zone "Platform"
        And I click on the "Content structure" link
        When I click on the actionbar action "Minimize"
        Then I don't see "Minimize" text

    @javascript
    Scenario: As a admin User, I want to use side menu
        Given I go to PlatformUI app with username "admin" and password "publish"
        And I click on the navigation zone "Platform"
        And I click on the "Content structure" link
        And I click on the actionbar action "Content tree"
        When I click on the content tree with path "Shopping/Products/eZ Publish - Man jacket"
        Then I should see "Price" text

    @javascript
    Scenario: As a admin User, I want to use side menu
        Given I go to PlatformUI app with username "admin" and password "publish"
        And I click on the navigation zone "Platform"
        And I click on the "Content structure" link
        And I click on the actionbar action "Content tree"
        And I click on the logo
        And I click on the navigation zone "Studio"
        And I click on the navigation zone "Studio Plus"
        And I click on the navigation zone "Platform"
        And I click on the "Content structure" link
        And I click on the "Media library" link
        And I click on the navigation zone "Admin panel"
        And I click on the logo
        And I click on "Root location" link
        And I click on the tab "Details"
        And I click on the tab "Activity"
        And I click on the tab "Analytics"
        And I click on the tab "View"
        And I click on the actionbar action "Create a content"
        And I click on the content type "Article"
        And I fill in "Title*" with "Bacalhau"
        And I fill in "Intro*" with "Ze manel"
        And I click on the actionbar action "Discard changes"
        And I click on the actionbar action "Minimize"
        And I click on the actionbar action "Minimize"
        And I logout
        Then I should see "Reset password" text
