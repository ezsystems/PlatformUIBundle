Feature: Copy content
    In order to copy objects
    As an Editor user
    I need to be able to copy an object that I am viewing

    Background:
        Given I am logged in as an 'Administrator' in PlatformUI

    ##
    #Copy objects to valid locations
    ##
    @javascript
    Scenario: Copying a content using the "copy" button
        Given a "Destination" folder exists
        And a "News Flash" article exists
        And I am on "News Flash" full view
        When I click on the action bar button "Copy"
        And I select the "eZ Platform/Destination" folder in the Universal Discovery Widget
        And I confirm the selection
        Then I am notified that "News Flash" has been copied under "Destination"
        And the content item was copied to "Destination/News Flash"

#    @javascript
#    Scenario: Copy one object that has children objects using the "Copy Subtree" button
#        Given a "Destination" folder exists
#        And an "Origin/News Flash" article exists
#        And I am on "Origin" full view
#        When I click on the action bar button "Copy Subtree"
#        And I select the "Destination" folder in the Universal Discovery Widget
#        And I confirm the selection
#        Then I am notified that "Origin" has been copied under "Destination"
#        And I see "Origin/News Flash" in the content tree
#        And I see "Destination/Origin/News Flash" in the content tree
