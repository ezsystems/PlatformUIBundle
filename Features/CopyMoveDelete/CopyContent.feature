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
    Scenario: Copy one object without children objects
        Given a "Destiny" folder exists
        And a "News Flash" article exists
        And I am viewing the "News Flash" article
        When I click on "Copy" link on the "Action Bar"
        And I select the "Destiny" folder in Universal Discovery Widget
        And I click the "Confirm selection" button
        Then I see the message "'News Flash' has been successfully copied under 'Destiny'"
        And I see "Destiny/News Flash" in content tree

    @javascript
    Scenario: Copy one object that has children objects
        Given an "Destiny" folder exists
        And an "Origin/News Flash" article exists
        And I am viewing the "News Flash" article
        When I copy the "News Flash" into the "Destiny" folder
        Then the "News Flash" is copied
        And I see "Origin/News Flash" in content tree
        And I see "Destiny/News Flash" in content tree
