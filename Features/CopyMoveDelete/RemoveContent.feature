Feature: Remove content
    In order to remove objects
    As an Editor user
    I need to be able to remove an object that I am viewing

    Background:
        Given I am logged in as an 'Administrator' in PlatformUI

    ##
    # Validate dialogs
    ##
    @javascript
    Scenario: Verify the existence of the removal confirmation request
        Given a "News Flash" article exists
        And I am on "News Flash" full view
        When I click on the action bar button "Send to Trash"
        Then I am asked to confirm if I am sure that I want to send the content to trash
        And I see a confirmation button
        And I see a cancel button

    ##
    # Delete objects
    ##
    @javascript
    Scenario: Remove one object and confirm the removal
        Given a "News Flash" article exists
        When I remove "News Flash"
        And I confirm the removal
        Then I am notified that '"News Flash" sent to Trash'
        And I do not see "News Flash" in the content tree

    @javascript
    Scenario: Remove one object and do not confirm the removal
        Given a "News Flash" article exists
        When I remove "News Flash"
        And I do not confirm the removal
        Then I am not notified that '"News Flash" sent to Trash'
        And I see "News Flash" in the content tree

    @javascript
    Scenario: Delete one object that has children objects
        Given a "News/News child" article exists
        When I remove "News"
        And I confirm the removal
        Then I do not see "News" in the content tree

    @javascript
    Scenario: Removing one object should redirect to it's parent location view
        Given a "News/News child" article exists
        When I remove "News child"
        And I confirm the removal
        Then I am on the "News" location view
        And I do not see "News/News child" in the content tree
