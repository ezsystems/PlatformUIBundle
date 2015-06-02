Feature: Remove content using te role of Editor
    In order to validate the remove action
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
        When I remove the article
        Then I see a "Are you sure you want to send this content to trash?" message
        And I see a "Confirm" button
        And I see a "Cancel" button

    ##
    #Delete objects
    ##
    @javascript
    Scenario: Remove one object and confirm the removal
        Given a "News Flash" article exists
        When I remove the "News Flash" article
        And I confirm the removal
        Then the "News Flash" is removed with message "'News Flash' sent to trash"
        And I do not see "News flash" in content tree

    @javascript
    Scenario: Remove one object and do not confirm the removal
        Given a "News Flash" article exists
        When I remove the "News Flash" article
        And I do not confirm the removal
        Then the article is not removed

    @javascript
    Scenario: Delete one object that has children objects
        Given a "News" folder exists
        And a "News child" article exists under "News" folder
        When I remove the "News" folder
        And I confirm the removal
        Then the "News" folder is removed
        And the "News child" article is removed

    @javascript
    Scenario: Removing one object should redirect to it's parent location view
        Given a "News" folder exists
        And a "News child" article exists under "News" folder
        When I remove the "News child" article
        And I confirm the removal
        Then the "News child" article is removed
        Then I am on the "News" view form

    @javascript
    Scenario: Content tree is updated after the removal of an object
        Given an "Origin" folder exists
        And a "News Flash" article exists as a child of "Origin"
        When I remove the "News Flash" article
        And I confirm the removal
        Then the "News Flash" article is removed
        And I do not see "News flash" in content tree as child of "Origin" folder
