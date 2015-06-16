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
        And I am viewing the article
        When I click on "Send to Trash" link on the "Action Bar"
        Then I see a "Are you sure you want to send this content to trash?" message
        And I see a "Confirm" button
        And I see a "Cancel" button

    ##
    #Delete objects
    ##
    @javascript
    Scenario: Remove one object and confirm the removal
        Given a "News Flash" article exists
        And I am viewing the article
        When I remove the "News Flash" article
        And I confirm the removal
        Then the "News Flash" is removed with message "'News Flash' sent to trash"
        And I do not see "News flash" in content tree

    @javascript
    Scenario: Remove one object and do not confirm the removal
        Given a "News Flash" article exists
        And I am viewing the article
        When I remove the "News Flash" article
        And I do not confirm the removal
        Then the article is not removed

    @javascript
    Scenario: Delete one object that has children objects
        Given a "News/News child" article exists
        And I am viewing the "News" folder
        When I remove the "News" folder
        And I confirm the removal
        Then the "News" folder is removed
        And the "News child" article is removed

    @javascript
    Scenario: Removing one object should redirect to it's parent location view
        Given a "News/News child" article exists
        And I am viewing the "News child" article
        When I remove the "News child" article
        And I confirm the removal
        Then the "News child" article is removed
        Then I am on the "News" location view
