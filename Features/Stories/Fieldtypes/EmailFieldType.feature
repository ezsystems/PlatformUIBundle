Feature: Test the validations done on fields from Editorial Interface - Email fieldtype

    @javascript
    Scenario: Use of invalid email field
        Given I am logged in as admin on PlatformUI
        And a Content Type exists with identifier "Email" in Group with identifier "Content" with fields:
            | identifier | Type     | Name  |
            | name       | ezstring | Name  |
            | email      | ezemail  | Email |
        And I create a content of content type "Email" with:
            | Name      | Email    |
            | EmailTest | failtest |
        When I click on the actionbar action "Publish"
        Then I should see "The value should be a valid email address" text

    @javascript
    Scenario Outline: Use of invalid email field
        Given I am logged in as admin on PlatformUI
        And a Content Type exists with identifier "Email" in Group with identifier "Content" with fields:
            | identifier | Type     | Name  |
            | name       | ezstring | Name  |
            | email      | ezemail  | Email |
        And I create a content of content type "Email" with:
            | Name      | Email   |
            | EmailTest | <email> |
        When I click on the actionbar action "Publish"
        Then I should see "The value should be a valid email address" text

        Examples:
            | email      |
            | failemail  |
            | teste@     |

    @javascript
    Scenario: Use of valid email field
        Given I am logged in as admin on PlatformUI
        And a Content Type exists with identifier "Email" in Group with identifier "Content" with fields:
            | identifier | Type     | Name  |
            | name       | ezstring | Name  |
            | email      | ezemail  | Email |
        And I create a content of content type "Email" with:
            | Name      | Email         |
            | EmailTest | pass@test.com |
        When I click on the actionbar action "Publish"
        Then I should see "EmailTest" title
        And I should see an element 'Email' with value 'pass@test.com'

    @javascript
    Scenario Outline: Validate not filling required fields
        Given I am logged in as admin on PlatformUI
        And a Content Type exists with identifier "Email2" in Group with identifier "Content" with fields:
            | Identifier | Type     | Name  | Required |
            | name       | ezstring | Name  | true     |
            | email      | ezemail  | Email | true     |
        And I create a content of content type "Email2" with:
            | Name   | Email   |
            | <name> | <email> |
        When I click on the actionbar action "Publish"
        Then I should see "This field is required" text

        Examples:
            | name      | email         |
            | EmailTest |               |
            |           | test@test.com |

    @javascript
    Scenario: Validate filling required fields
        Given I am logged in as admin on PlatformUI
        And a Content Type exists with identifier "Email2" in Group with identifier "Content" with fields:
            | identifier | Type     | Name  | Required |
            | name       | ezstring | Name  | true     |
            | email      | ezemail  | Email | true     |
        And I create a content of content type "Email2" with:
            | Name      | Email         |
            | EmailTest | pass@test.com |
        When I click on the actionbar action "Publish"
        Then I should see "EmailTest" title
        And I should see an element 'Email' with value 'pass@test.com'
