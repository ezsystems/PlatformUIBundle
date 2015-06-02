Feature: Copy content using te role of Editor
    In order to validate the copy action
    As an Editor user
    I need to be able to copy an object that I am viewing

    Background:
        Given I am logged in as an Editor in PlatformUI

    ##
    #Copy objects to valid locations
    ##
    @javascript
    Scenario: Copy one object without children objects
        Given a "Destiny" folder exists
        And a "News Flash" article exists
        When I copy the "News Flash" into "Destiny" folder
        Then the "News Flash" is copied with message "'News Flash' has been successfully copied under 'Destiny'"
        And I see "News Flash" as a child of "Destiny" folder

    @javascript
    Scenario: Copy one object that has children objects
        Given an "Destiny" folder exists
        And an "Origin" folder exists
        And a "News Flash" article exists as a child of "Origin" folder
        When I copy the "News Flash" into "Destiny" folder
        Then the "News Flash" is copied
        And I see "News Flash" as a child of "Origin" folder
        And I see "News Flash" as a child of "Destiny" folder

    @javascript
    Scenario: Content tree is updated after the copy of an object
        Given an "Destiny" folder exists
        And an "Origin" folder exists
        And a "News Flash" article exists as a child of "Origin" folder
        When I copy the "News Flash" into "Destiny" folder
        Then the "News Flash" is copied
        And I see "News flash" in content tree as child of "Destiny" folder

    @javascript
    Scenario: Copy one object to an hidden location
        Given an "Destiny" folder exists
        And "Destiny" is hidden
        And a "News Flash" article exists
        When I copy the "News Flash" into "Destiny" folder
        Then the "News Flash" is copied
        And I see "News Flash" as a child of "Origin" folder
