Feature: Test the validations done on fields from Editorial Interface

    @javascript
    Scenario: No javascript error when displaying a content with an empty Url field
        Given I go to PlatformUI app with username "admin" and password "publish"
        And a Content Type exists with identifier "Checkbox" in Group with identifier "Content" with fields:
            | identifier | Type | Name |
            | name | ezstring | Name |
            | float | ezboolean | Checkbox |
        And I click on the menu zone "Platform"
        And I click on the "Content structure" link
        And I click on the side menu option "Create a content"
        And I click on the content type "Checkbox"
        And I fill in "Name" with "CheckTest"
        And I checked "Checkbox" checkbox
        When I click on the side menu option "Publish"
        Then I should see "CheckTest" title
        And I should see an element "Checkbox" with value "Yes"

    @javascript
    Scenario: No javascript error when displaying a content with an empty Url field
        Given I go to PlatformUI app with username "admin" and password "publish"
        And a Content Type exists with identifier "Checkbox" in Group with identifier "Content" with fields:
            | identifier | Type | Name |
            | name | ezstring | Name |
            | float | ezboolean | Checkbox |
        And I click on the menu zone "Platform"
        And I click on the "Content structure" link
        And I click on the side menu option "Create a content"
        And I click on the content type "Checkbox"
        And I fill in "Name" with "CheckTest"
        When I click on the side menu option "Publish"
        Then I should see "CheckTest" title
        And I should see an element "Checkbox" with value "No"
