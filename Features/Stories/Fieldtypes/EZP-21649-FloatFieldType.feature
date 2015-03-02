Feature: Test the validations done on fields from Editorial Interface

    @javascript
    Scenario: No javascript error when displaying a content with an empty Url field
        Given I go to PlatformUI app with username "admin" and password "publish"
        And a Content Type exists with identifier "Float" in Group with identifier "Content" with fields:
            | identifier | Type | Name |
            | name | ezstring | Name |
            | float | ezfloat | Float |
        And I click on the menu zone "Platform"
        And I click on the "Content structure" link
        And I click on the side menu option "Create a content"
        And I click on the content type "Float"
        And I fill in "Name" with "FloatTest"
        And I fill in "Float" with "failtest"
        When I click on the side menu option "Publish"
        Then I should see "The value should be a valid float number" text

    @javascript
    Scenario: No javascript error when displaying a content with an empty Url field
        Given I go to PlatformUI app with username "admin" and password "publish"
        And a Content Type exists with identifier "Float" in Group with identifier "Content" with fields:
            | identifier | Type | Name |
            | name | ezstring | Name |
            | float | ezfloat | Float |
        And I click on the menu zone "Platform"
        And I click on the "Content structure" link
        And I click on the side menu option "Create a content"
        And I click on the content type "Float"
        And I fill in "Name" with "FloatTest"
        And I fill in "Float" with "1,2"
        When I click on the side menu option "Publish"
        Then I should see "FloatTest" title
        And I should see an element 'Float' with value '1,2'

    @javascript
    Scenario: No javascript error when displaying a content with an empty Url field
        Given I go to PlatformUI app with username "admin" and password "publish"
        And a Content Type exists with identifier "Float" in Group with identifier "Content" with fields:
            | identifier | Type | Name | required |
            | name | ezstring | Name | false |
            | float | ezfloat | Float | true |
        And I click on the menu zone "Platform"
        And I click on the "Content structure" link
        And I click on the side menu option "Create a content"
        And I click on the content type "Float"
        And I fill in "Name" with "FloatTest"
        When I click on the side menu option "Publish"
        Then I should see "This field is required" text

    @javascript
    Scenario: No javascript error when displaying a content with an empty Url field
        Given I go to PlatformUI app with username "admin" and password "publish"
        And a Content Type exists with identifier "Float" in Group with identifier "Content" with fields:
            | identifier | Type | Name | validator |
            | name | ezstring | Name | false |
            | float | ezfloat | Float | FloatValue:2.0~3.1 |
        And I click on the menu zone "Platform"
        And I click on the "Content structure" link
        And I click on the side menu option "Create a content"
        And I click on the content type "Float"
        And I fill in "Name" with "FloatTest"
        When I fill in "Float" with "1.9"
        Then I should see "The value should be more than or equal to 2" text
        When I fill in "Float" with "3.5"
        Then I should see "The value should be less than or equal to 3.1" text
