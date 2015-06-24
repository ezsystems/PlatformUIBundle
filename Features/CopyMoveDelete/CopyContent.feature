Feature: Copy content
    In order to copy objects
    As an Editor user
    I need to be able to copy an object that I am viewing

    Background:
        Given I am logged in as an Editor in PlatformUI

    ##
    #Copy objects to valid locations
    ##
    @javascript
    Scenario: Copying a content using the "copy" button
        Given a "Destination" folder exists
        And a "News Flash" article exists
        And I am on "News Flash" full view
        When I click on the Copy button on the Action Bar
        And I select the "Destination" folder in the Universal Discovery Widget
        And I confirm the selection
        Then I am notified that "News Flash" has been copied under "Destination"
        And I see "Destination/News Flash" in the content tree

    @javascript
    Scenario: Copy one object that has children objects using the "Copy Subtree" button
        Given a "Destination" folder exists
        And an "Origin/News Flash" article exists
        And I am on "Origin" full view
        When I click the Copy Subtree button on the Action Bar
        And I select the "Destination" folder in the Universal Discovery Widget
        And I confirm the selection
        Then I am notified that "Origin" has been copied under "Destination"
        And I see "Origin/News Flash" in the content tree
        And I see "Destination/Origin/News Flash" in the content tree
