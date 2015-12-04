Feature: Basic PlatformUI interaction tests

    @common @javascript
    Scenario: As a admin User, I want to login to PlatformUI
        Given I go to PlatformUI app with username "admin" and password "publish"
        Then I should be on the dashboard

    @common @javascript
    Scenario: As a admin User, I want to minimize the discovery bar
        Given I go to PlatformUI app with username "admin" and password "publish"
        And I click on the navigation zone "Content"
        When I click on the navigation item "Content structure"
        Then I click on the discovery bar button "Minimize"

    @common @javascript
    Scenario: As a admin User, I want to minimize the action bar
        Given I go to PlatformUI app with username "admin" and password "publish"
        And I click on the navigation zone "Content"
        When I click on the navigation item "Content structure"
        Then I click on the action bar button "Minimize"

    @common @javascript
    Scenario: As a admin User, I want to edit content
       Given I go to PlatformUI app with username "admin" and password "publish"
         And I click on the navigation zone "Content"
         And I click on the navigation item "Content structure"
        When I click on the action bar button "Edit"
         And I fill in "Name" with "HomePage"
         And I click on the edit action bar button "Publish"
        Then I am redirected to a location view
        #And I am notified that the content has been published
