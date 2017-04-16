Feature: Impossible to browse the media library

    @javascript
    Scenario: Browse Media libary Files
        Given I go to PlatformUI app with username "admin" and password "publish"
        And I click on the menu zone "Create"
        And I click on the "Media library" link
        And I click on the side menu option "Content tree"
        When I click on the "Files" link
        Then I should see "Files" title
        When I click on the tab "Details"
        Then I should see "Hidden" text
        When I click on the tab "Activity"
        Then I should see "Activity content" text
        When I click on the tab "Analytics"
        Then I should see "Analytics content" text
        When I click on the tab "View"
        Then I should see "Content" text

    @javascript
    Scenario: Browse Media libary Images
        Given I go to PlatformUI app with username "admin" and password "publish"
        And I click on the menu zone "Create"
        And I click on the "Media library" link
        And I click on the side menu option "Content tree"
        When I click on the "Images" link
        Then I should see "Images" title
        When I click on the tab "Details"
        Then I should see "Hidden" text
        When I click on the tab "Activity"
        Then I should see "Activity content" text
        When I click on the tab "Analytics"
        Then I should see "Analytics content" text
        When I click on the tab "View"
        Then I should see "Content" text

    @javascript
    Scenario: Browse Media libary Multimedia
        Given I go to PlatformUI app with username "admin" and password "publish"
        And I click on the menu zone "Create"
        And I click on the "Media library" link
        And I click on the side menu option "Content tree"
        When I click on the "Multimedia" link
        Then I should see "Multimedia" title
        When I click on the tab "Details"
        Then I should see "Hidden" text
        When I click on the tab "Activity"
        Then I should see "Activity content" text
        When I click on the tab "Analytics"
        Then I should see "Analytics content" text
        When I click on the tab "View"
        Then I should see "Content" text
