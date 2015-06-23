Feature: Move content
    In order to move objects
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
        And a "Origin/News Flash" article exists
        And I am on "News Flash" full view
        When I click "Move" button on the "Action Bar"
        And I select "Older News" folder in the Universal Discovery Widget
        And I click the "Confirm selection" button
        Then I am notified that "News Flash' has been successfully moved under 'Older News'"
        And I see "Older News/News Flash" in the content tree
        And I do not see "Origin/News flash" in the content tree

    @javascript
    Scenario: Move one object that has children objects
        Given an "Older News" folder exists
        And a "Tomorrow news/News Flash" article exists
        And I am on the "News Flash" full view
        When I move the "Tomorrow news" into the "Older News" folder
        Then "Tomorrow news" is moved
        And I see "Older News/Tomorrow news/News Flash" in the content tree
