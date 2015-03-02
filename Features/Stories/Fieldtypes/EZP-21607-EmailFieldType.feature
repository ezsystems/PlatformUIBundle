Feature: Test the validations done on fields from Editorial Interface

    @javascript
    Scenario: No javascript error when displaying a content with an empty Url field
        Given I go to PlatformUI app with username "admin" and password "publish"
        And a Content Type exists with identifier "Email" in Group with identifier "Content" with fields:
            | identifier | Type     | Name  |
            | name       | ezstring | Name  |
            | email      | ezemail  | Email |
        And I click on the menu zone "Platform"
        And I click on the "Content structure" link
        And I click on the side menu option "Create a content"
        And I click on the content type "Email"
        And I fill in "Name" with "EmailTest"
        And I fill in "Email" with "failtest"
        When I click on the side menu option "Publish"
        Then I should see "The value should be a valid email address" text


    @javascript
    Scenario: No javascript error when displaying a content with an empty Url field
        Given I go to PlatformUI app with username "admin" and password "publish"
        And a Content Type exists with identifier "Email" in Group with identifier "Content" with fields:
            | identifier | Type     | Name  |
            | name       | ezstring | Name  |
            | email      | ezemail  | Email |
        And I click on the menu zone "Platform"
        And I click on the "Content structure" link
        And I click on the side menu option "Create a content"
        And I click on the content type "Email"
        And I fill in "Name" with "EmailTest"
        And I fill in "Email" with "pass@test.com"
        When I click on the side menu option "Publish"
        Then I should see "EmailTest" title
        And I should see an element 'Email' with value 'pass@test.com'

    @javascript
    Scenario: No javascript error when displaying a content with an empty Url field
        Given I go to PlatformUI app with username "admin" and password "publish"
        And a Content Type exists with identifier "Email" in Group with identifier "Content" with fields:
            | identifier | Type     | Name  | required |
            | name       | ezstring | Name  | required |
            | email      | ezemail  | Email | required |
        And I click on the menu zone "Platform"
        And I click on the "Content structure" link
        And I click on the side menu option "Create a content"
        And I click on the content type "Email"
        And I fill in "Name" with "EmailTest"
        When I click on the side menu option "Publish"
        Then I should see "This field is required" text
