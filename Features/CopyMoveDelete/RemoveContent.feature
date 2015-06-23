Feature: Remove content
    In order to remove objects
    As an Editor user
    I need to be able to remove an object that I am viewing

    Background:
        Given I am logged in as an Editor in PlatformUI

    ##
    # Validate dialogs
    ##
    @javascript
    Scenario: Verify the existence of the removal confirmation request
        Given an article exists
        I am on the article full view
        When I click "Send to Trash" button on the "Action Bar"
        Then I see a "Are you sure you want to send this content to trash?" message
        And I see a "Confirm" button
        And I see a "Cancel" button

    ##
    #Delete objects
    ##
    @javascript
    Scenario: Remove one object and confirm the removal
        Given a "News Flash" article exists
        And I am on "News Flash" full view
        When I remove "News Flash" article
        And I confirm the removal
        Then I am notified that "'News Flash' sent to trash"
        And I do not see "News flash" in the content tree

    @javascript
    Scenario: Remove one object and do not confirm the removal
        Given a "News Flash" article exists
        And I am on "News Flash" full view
        When I remove "News Flash" article
        And I do not confirm the removal
        Then I am not notified that "'News Flash' sent to trash"
        And I see "News flash" in the content tree

    @javascript
    Scenario: Delete one object that has children objects
        Given a "News/News child" article exists
        And I am on "News" full view
        When I remove "News" folder
        And I confirm the removal
        Then I do not see "News" in the content tree

    @javascript
    Scenario: Removing one object should redirect to it's parent location view
        Given a "News/News child" article exists
        And I am on "News child" full view
        When I remove "News child" article
        And I confirm the removal
        Then I am on the "News" location view
        And I do not see "News/News child" in the content tree
