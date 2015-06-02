Feature: Move content using te role of Editor
    In order to validate the move action
    As an Editor user
    I need to be able to move an object that I am viewing

    Background:
        Given I am logged in as an Editor in PlatformUI

    ##
    #Move objects to valid locations
    ##
    @javascript
    Scenario: Move one object without children objects
        Given an "Older News" folder exists
        And a "News Flash" article exists
        When I move the "News Flash" as a child of "Older News"
        Then the "News Flash" is moved with message "'News flash' has been successfully moved under 'Older News'"
        And I see "News Flash" as a child of "Older News" folder

    @javascript
    Scenario: Move one object that has children objects
        Given an "Older News" folder exists
        And a "Tomorrow news" folder exists
        And a "News Flash" article exists as a child of "Tomorrow news"
        When I move the "Tomorrow news" as a child of "Older News"
        Then the "Tomorrow news" is moved
        And I see "Tomorrow news" as a child of "Older News"
        And I see "News Flash" as a child of "Tomorrow news"

    @javascript
    Scenario: Content tree is updated after the move of an object
        Given an "Destiny" folder exists
        And an "Origin" folder exists
        And a "News Flash" article exists as a child of "Origin"
        When I move the "News Flash" into "Destiny" folder
        Then the "News Flash" is moved
        And I see "News flash" in content tree as child of "Destiny" folder
        And I do not see "News flash" in content tree as child of "Origin" folder

    @javascript
    Scenario: Move one object to an hidden location
        Given an "Older News" folder exists
        And "Older News" is hidden
        And a "News Flash" article exists
        And "News Flash"  is not hidden
        When I move the "News Flash" as a child of "Older News"
        Then the "News Flash" is moved
        And I see "News Flash" as a child of "Older News"
        And "News Flash" is hidden
