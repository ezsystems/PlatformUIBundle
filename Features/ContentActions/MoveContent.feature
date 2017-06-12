Feature: Move content
    In order to move objects
    As an Editor user
    I need to be able to move an object that I am viewing

    Background:
        Given I am logged in as an 'Administrator' in PlatformUI

    ##
    #Move objects to valid locations
    ##
    @javascript
    Scenario: Move one object without children objects
        Given an "Older News" folder exists
        And a "Origin/News Flash" article exists
        And I am on "News Flash" full view
        When I click on the action bar button "Move"
        And I select the "eZ Platform/Older News" folder in the Universal Discovery Widget
        And I confirm the selection
        Then I am notified that "News Flash" has been moved under "Older News"
        And the content item was moved to "Older News/News Flash"
        And the content item "Origin/News flash" was removed

    @javascript
    Scenario: Move one object that has children objects
        Given an "Older News" folder exists
        And a "Tomorrow news/News Flash" article exists
        When I move "Tomorrow news" into the "Older News" folder
        And the content item was moved to "Older News/Tomorrow news/News Flash"
